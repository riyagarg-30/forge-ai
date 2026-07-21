import { parseContext } from './context.js'

export async function runLegalAgent(context) {
  const { businessDetails, startupName } = parseContext(context)
  const country = businessDetails.country || 'United States'
  const industry = businessDetails.industry || 'Technology'

  const isHealthcare = /health|medical|pharma|clinical/i.test(industry)
  const isFintech = /fintech|finance|bank|payment|crypto/i.test(industry)

  return {
    legalRiskAssessment:
      `Overall legal risk for ${startupName} in ${country} is ${isHealthcare || isFintech ? 'elevated' : 'moderate'} and manageable for early-stage. Primary concerns: data privacy compliance${isHealthcare ? ', healthcare regulations (HIPAA/FDA)' : ''}${isFintech ? ', financial licensing (KYC/AML)' : ''}.`,
    regulatoryConsiderations: [
      `GDPR compliance required if serving EU users from ${country}`,
      'CCPA/CPRA compliance for California residents',
      'SOC 2 Type I certification recommended before enterprise sales',
      'AI-generated content liability — implement clear disclaimers',
      ...(isHealthcare ? ['HIPAA compliance for PHI handling', 'FDA SaMD classification review'] : []),
      ...(isFintech ? ['Money transmitter licensing review', 'PCI-DSS if handling payments'] : []),
    ],
    ipConsiderations:
      `Conduct trademark search for "${startupName}" before launch. File provisional patent only if core technology is truly novel.`,
    complianceRequirements: [
      'Privacy Policy and Terms of Service (required at launch)',
      'Cookie consent banner for EU traffic',
      'Data Processing Agreement (DPA) template for B2B customers',
      'Employee/contractor IP assignment agreements',
    ],
    legalRisks: [
      { risk: 'Data breach liability', severity: 'Medium', mitigation: 'Encryption at rest/transit, regular security audits' },
      { risk: 'AI output accuracy claims', severity: 'Medium', mitigation: 'Clear disclaimers, human-in-the-loop for critical decisions' },
      ...(isHealthcare ? [{ risk: 'Healthcare regulatory delay', severity: 'High', mitigation: 'Engage regulatory counsel early; consider B2B wellness positioning first' }] : []),
      { risk: 'Competitor IP infringement', severity: 'Low', mitigation: 'Prior art search, clean-room development' },
    ],
    readinessSignals: {
      regulatoryClarity: isHealthcare || isFintech ? 52 : 74,
      complianceReadiness: 68,
      ipProtection: 71,
    },
  }
}
