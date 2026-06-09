exports.checkEligibility = (req, res) => {
  const { age, category, nationality, graduationStatus, attemptsUsed = 0 } = req.body;

  if (!age || !category || !nationality || !graduationStatus) {
    return res.status(400).json({ message: 'Missing required eligibility inputs (age, category, nationality, graduationStatus).' });
  }

  const ageNum = parseInt(age, 10);
  const attemptsUsedNum = parseInt(attemptsUsed, 10);

  let maxAge = 32;
  let maxAttempts = 6;
  const isIndian = nationality.toLowerCase() === 'indian';

  // Category based rules
  switch (category.toLowerCase()) {
    case 'obc':
      maxAge = 35;
      maxAttempts = 9;
      break;
    case 'sc':
    case 'st':
      maxAge = 37;
      maxAttempts = 99; // Represents Unlimited
      break;
    case 'pwd':
      maxAge = 42;
      maxAttempts = 9;
      break;
    case 'general':
    default:
      maxAge = 32;
      maxAttempts = 6;
      break;
  }

  // Verification checks
  let isEligible = true;
  const reasons = [];

  if (ageNum < 21) {
    isEligible = false;
    reasons.push('Minimum age required is 21 years.');
  }

  if (ageNum > maxAge) {
    isEligible = false;
    reasons.push(`Maximum age allowed for your category (${category.toUpperCase()}) is ${maxAge} years. You are ${ageNum}.`);
  }

  if (attemptsUsedNum >= maxAttempts) {
    isEligible = false;
    reasons.push(`Maximum attempts allowed for ${category.toUpperCase()} is ${maxAttempts === 99 ? 'Unlimited' : maxAttempts}. You have used ${attemptsUsedNum}.`);
  }

  if (graduationStatus === 'not_graduated') {
    isEligible = false;
    reasons.push('You must at least be in the final year of graduation to be eligible.');
  }

  // Service qualifications
  const eligibleServices = [];
  if (isEligible) {
    if (isIndian) {
      eligibleServices.push('IAS (Indian Administrative Service)', 'IPS (Indian Police Service)', 'IFS (Indian Foreign Service)', 'IRS (Indian Revenue Service)', 'Other Group A/B Services');
    } else {
      eligibleServices.push('IRS (Indian Revenue Service)', 'Other Group A/B Central Services');
      reasons.push('Note: IAS, IPS, and IFS are reserved exclusively for Indian citizens.');
    }
  }

  res.json({
    eligible: isEligible,
    remainingAttempts: maxAttempts === 99 ? 'Unlimited' : Math.max(0, maxAttempts - attemptsUsedNum),
    servicesEligibleFor: eligibleServices,
    reasons,
    summary: isEligible 
      ? 'Congratulations! You fulfill all base eligibility criteria for the UPSC Civil Services Examination.' 
      : 'You do not meet one or more eligibility requirements at this time.'
  });
};
