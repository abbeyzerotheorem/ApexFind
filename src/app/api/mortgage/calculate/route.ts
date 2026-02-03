export async function POST(request: Request) {
  const { propertyPrice, downPaymentPercent, loanTerm, interestRate } = await request.json()
  
  // Nigerian mortgage calculation
  const downPayment = propertyPrice * (downPaymentPercent / 100)
  const loanAmount = propertyPrice - downPayment
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = loanTerm * 12
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  
  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - loanAmount
  
  // Updated list of major Nigerian mortgage-providing banks
  const nigerianBanks = [
    { name: 'National Housing Fund (NHF)', rate: 6.0, minDownPayment: 10 },
    { name: 'Stanbic IBTC Bank', rate: 17.5, minDownPayment: 20 },
    { name: 'GTBank', rate: 18.0, minDownPayment: 30 },
    { name: 'Zenith Bank', rate: 18.5, minDownPayment: 30 },
    { name: 'Access Bank', rate: 19.0, minDownPayment: 35 },
    { name: 'First Bank', rate: 19.5, minDownPayment: 30 }
  ]
  
  return Response.json({
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    loanAmount: Math.round(loanAmount),
    downPayment: Math.round(downPayment),
    affordability: {
      recommendedMonthlyIncome: Math.round(monthlyPayment * 3), // 33% debt-to-income rule
      affordableFor: monthlyPayment < 300000 ? 'Middle class' : 'High income'
    },
    nigerianBanks,
    disclaimer: 'Rates based on current Nigerian mortgage market benchmarks. Consult your bank for actual personalized quotes.'
  })
}
