function parseContext(context) {
  if (typeof context === 'string') {
    return { ideaText: context, businessDetails: {}, startupName: 'Your Startup', priorResults: {} }
  }
  return {
    ideaText: context.ideaText || '',
    businessDetails: context.businessDetails || {},
    startupName: context.startupName || context.businessDetails?.startupName || 'Your Startup',
    priorResults: context.priorResults || {},
  }
}

export { parseContext }
