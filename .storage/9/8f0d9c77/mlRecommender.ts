import { CarbonCategories, Recommendation, CarbonEntry } from '../types';
import { RECOMMENDATIONS_DB, MOCK_COMMUNITY_DATA } from '../config/constants';
import { CarbonCalculator } from './carbonCalculator';

export class MLRecommender {
  static getPersonalizedRecommendations(
    userCategories: CarbonCategories,
    nearbyUsers: CarbonEntry[] = MOCK_COMMUNITY_DATA
  ): Recommendation[] {
    // Step 1: Find user's top emitting categories
    const categoryBreakdown = CarbonCalculator.getCategoryBreakdown(userCategories);
    const topCategories = categoryBreakdown
      .sort((a, b) => b.co2 - a.co2)
      .slice(0, 3)
      .map(item => item.category);

    // Step 2: Normalize user vector for similarity calculation
    const userVector = this.normalizeVector(userCategories);

    // Step 3: Find k-nearest neighbors using cosine similarity
    const similarities = nearbyUsers.map(neighbor => ({
      user: neighbor,
      similarity: this.cosineSimilarity(userVector, this.normalizeVector(neighbor.categories))
    }));

    const kNearestNeighbors = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    // Step 4: Get recommendations for top categories
    const recommendations: Recommendation[] = [];
    
    topCategories.forEach(category => {
      const categoryRecommendations = RECOMMENDATIONS_DB.filter(rec => rec.category === category);
      
      // Score recommendations based on neighbor success and potential impact
      const scoredRecommendations = categoryRecommendations.map(rec => ({
        ...rec,
        score: this.calculateRecommendationScore(rec, userCategories, kNearestNeighbors)
      }));

      // Add top recommendation for this category
      const topRec = scoredRecommendations.sort((a, b) => b.score - a.score)[0];
      if (topRec && !recommendations.find(r => r.id === topRec.id)) {
        recommendations.push(topRec);
      }
    });

    return recommendations.slice(0, 3);
  }

  private static normalizeVector(categories: CarbonCategories): number[] {
    const values = Object.values(categories);
    const magnitude = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
    
    return magnitude === 0 ? values : values.map(val => val / magnitude);
  }

  private static cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;
    
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    return Math.max(0, dotProduct); // Normalized vectors, so no need to divide by magnitudes
  }

  private static calculateRecommendationScore(
    recommendation: Recommendation,
    userCategories: CarbonCategories,
    neighbors: Array<{ user: CarbonEntry; similarity: number }>
  ): number {
    // Base score from potential reduction
    let score = recommendation.potential_reduction;

    // Boost score based on user's current emission in this category
    const userCategoryValue = userCategories[recommendation.category];
    const categoryFactor = Math.min(userCategoryValue / 100, 2); // Cap at 2x boost
    score *= (1 + categoryFactor);

    // Adjust for difficulty (easier recommendations get slight boost)
    const difficultyMultiplier = {
      easy: 1.2,
      medium: 1.0,
      hard: 0.8
    };
    score *= difficultyMultiplier[recommendation.difficulty];

    // Boost based on neighbor similarity (collaborative filtering aspect)
    const avgSimilarity = neighbors.reduce((sum, n) => sum + n.similarity, 0) / neighbors.length;
    score *= (1 + avgSimilarity * 0.3);

    return score;
  }

  static getCommunityStats(nearbyUsers: CarbonEntry[] = MOCK_COMMUNITY_DATA) {
    const totalEmissions = nearbyUsers.map(user => 
      CarbonCalculator.calculateTotalCO2(user.categories)
    ).sort((a, b) => a - b);

    const count = totalEmissions.length;
    const median = count > 0 ? totalEmissions[Math.floor(count / 2)] : 0;
    const percentile75 = count > 0 ? totalEmissions[Math.floor(count * 0.75)] : 0;
    const average = count > 0 ? totalEmissions.reduce((sum, val) => sum + val, 0) / count : 0;

    return {
      median: Math.round(median),
      percentile75: Math.round(percentile75),
      average: Math.round(average),
      count
    };
  }
}