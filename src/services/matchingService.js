/**
 * Smart Coach Matching Service
 * AI-powered algorithm to match students with the best coaches
 * based on learning style, goals, timezone, and availability
 */

/**
 * Calculate compatibility score between student and coach
 * @param {Object} studentProfile - Student's profile and preferences
 * @param {Object} coachProfile - Coach's profile and attributes
 * @returns {Object} Match score (0-100) and reasoning
 */
export const calculateMatchScore = (studentProfile, coachProfile) => {
    let score = 0;
    const reasons = [];

    // 1. Timezone Match (30 points)
    if (studentProfile.timezone && coachProfile.timezone) {
        if (studentProfile.timezone === coachProfile.timezone) {
            score += 30;
            reasons.push('Perfect timezone match');
        } else if (isCloseTimezone(studentProfile.timezone, coachProfile.timezone)) {
            score += 20;
            reasons.push('Compatible timezone');
        }
    } else {
        // Default points if timezone not specified
        score += 15;
    }

    // 2. Learning Style Match (25 points)
    const styleMatch = getStyleMatchScore(studentProfile.learningStyle, coachProfile.teachingStyle);
    score += styleMatch.points;
    if (styleMatch.reason) reasons.push(styleMatch.reason);

    // 3. Goal Alignment (20 points)
    const goalMatch = getGoalMatchScore(studentProfile.goal, coachProfile.specializations);
    score += goalMatch.points;
    if (goalMatch.reason) reasons.push(goalMatch.reason);

    // 4. Age Appropriateness (15 points)
    const ageMatch = getAgeMatchScore(studentProfile.age, coachProfile.preferredAgeRange);
    score += ageMatch.points;
    if (ageMatch.reason) reasons.push(ageMatch.reason);

    // 5. Availability (10 points)
    const availMatch = getAvailabilityScore(coachProfile);
    score += availMatch.points;
    if (availMatch.reason) reasons.push(availMatch.reason);

    return {
        score: Math.min(100, score),
        reasons,
        coachId: coachProfile.id,
        coachName: coachProfile.name || coachProfile.coachName || 'Coach'
    };
};

/**
 * Check if timezones are close (1-2 hours difference)
 */
const isCloseTimezone = (tz1, tz2) => {
    const tzGroups = {
        'IST': ['IST', 'Asia/Kolkata', 'India'],
        'PST': ['PST', 'America/Los_Angeles', 'Pacific'],
        'EST': ['EST', 'America/New_York', 'Eastern'],
        'GMT': ['GMT', 'UTC', 'Europe/London']
    };

    for (const group of Object.values(tzGroups)) {
        const has1 = group.some(t => tz1?.includes(t));
        const has2 = group.some(t => tz2?.includes(t));
        if (has1 && has2) return true;
    }
    return false;
};

/**
 * Calculate learning/teaching style match
 */
const getStyleMatchScore = (studentStyle, coachStyle) => {
    const styleMatrix = {
        'Visual': { 'Tactical': 25, 'Strategic': 20, 'Balanced': 22 },
        'Verbal': { 'Strategic': 25, 'Tactical': 18, 'Balanced': 22 },
        'Hands-on': { 'Balanced': 25, 'Tactical': 22, 'Strategic': 18 }
    };

    const defaultStyle = 'Balanced';
    const sStyle = studentStyle || 'Visual';
    const cStyle = coachStyle || defaultStyle;

    const points = styleMatrix[sStyle]?.[cStyle] || 15;

    if (points >= 22) {
        return { points, reason: `${cStyle} teaching matches ${sStyle} learning style` };
    }
    return { points, reason: null };
};

/**
 * Calculate goal alignment score
 */
const getGoalMatchScore = (studentGoal, coachSpecializations = []) => {
    const goalToSpec = {
        'Tournament preparation': ['Openings', 'Tournament', 'Competition'],
        'Rating improvement': ['Tactics', 'Strategy', 'Rating'],
        'Casual learning': ['Fundamentals', 'Beginner', 'Fun'],
        'Advanced tactics': ['Tactics', 'Combinations', 'Middlegame'],
        'Endgame mastery': ['Endgame', 'Strategy', 'Advanced']
    };

    const relevantSpecs = goalToSpec[studentGoal] || ['Fundamentals'];
    const specs = coachSpecializations.length ? coachSpecializations : ['Fundamentals', 'Tactics'];

    const hasMatch = specs.some(s =>
        relevantSpecs.some(r => s.toLowerCase().includes(r.toLowerCase()))
    );

    if (hasMatch) {
        return { points: 20, reason: `Specializes in ${studentGoal?.split(' ')[0] || 'relevant topics'}` };
    }
    return { points: 10, reason: null };
};

/**
 * Calculate age appropriateness score
 */
const getAgeMatchScore = (studentAge, preferredRange) => {
    const age = parseInt(studentAge) || 10;
    const range = preferredRange || '5-18';

    const [minAge, maxAge] = range.split('-').map(a => parseInt(a));

    if (age >= minAge && age <= maxAge) {
        return { points: 15, reason: 'Experienced with this age group' };
    } else if (Math.abs(age - minAge) <= 2 || Math.abs(age - maxAge) <= 2) {
        return { points: 10, reason: null };
    }
    return { points: 5, reason: null };
};

/**
 * Calculate availability score
 */
const getAvailabilityScore = (coachProfile) => {
    const slots = coachProfile.availableSlots || coachProfile.maxStudents || 5;
    const currentStudents = coachProfile.currentStudents || 0;
    const available = slots - currentStudents;

    if (available >= 5) {
        return { points: 10, reason: 'High availability' };
    } else if (available >= 2) {
        return { points: 7, reason: 'Good availability' };
    } else if (available >= 1) {
        return { points: 4, reason: 'Limited availability' };
    }
    return { points: 0, reason: 'Fully booked' };
};

/**
 * Get top N coach recommendations for a student
 * @param {Object} studentProfile - Student's profile
 * @param {Array} coaches - Array of coach profiles
 * @param {number} topN - Number of recommendations to return
 * @returns {Array} Sorted array of matches with scores and reasons
 */
export const getTopCoachRecommendations = (studentProfile, coaches, topN = 3) => {
    if (!coaches || coaches.length === 0) {
        return [];
    }

    const matches = coaches.map(coach => calculateMatchScore(studentProfile, coach));

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    // Return top N
    return matches.slice(0, topN);
};

/**
 * Get match score label based on score value
 */
export const getMatchLabel = (score) => {
    if (score >= 85) return { label: 'Excellent Match', color: '#10B981' };
    if (score >= 70) return { label: 'Great Match', color: '#3B82F6' };
    if (score >= 50) return { label: 'Good Match', color: '#F59E0B' };
    return { label: 'Possible Match', color: '#6B7280' };
};

export default {
    calculateMatchScore,
    getTopCoachRecommendations,
    getMatchLabel
};
