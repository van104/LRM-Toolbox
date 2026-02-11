import type { RouteRecordRaw } from 'vue-router';

/** 财务工具路由 */
const financeRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/currency-converter',
    name: 'CurrencyConverterTool',
    component: () => import('@/components/tools/finance/CurrencyConverterTool.vue')
  },
  {
    path: '/tools/mortgage-calculator',
    name: 'MortgageCalculatorTool',
    component: () => import('@/components/tools/finance/MortgageCalculatorTool.vue')
  },
  {
    path: '/tools/tax-calculator',
    name: 'TaxCalculatorTool',
    component: () => import('@/components/tools/finance/TaxCalculatorTool.vue')
  },
  {
    path: '/tools/discount-calculator',
    name: 'DiscountCalculatorTool',
    component: () => import('@/components/tools/finance/DiscountCalculatorTool.vue')
  },
  {
    path: '/tools/utility-bill',
    name: 'UtilityBillTool',
    component: () => import('@/components/tools/finance/UtilityBillTool.vue')
  },
  {
    path: '/tools/compound-interest',
    name: 'CompoundInterestTool',
    component: () => import('@/components/tools/finance/CompoundInterestTool.vue')
  },
  {
    path: '/tools/pension-estimator',
    name: 'PensionEstimatorTool',
    component: () => import('@/components/tools/finance/PensionEstimatorTool.vue')
  },
  {
    path: '/tools/interest-rates',
    name: 'InterestRateTool',
    component: () => import('@/components/tools/finance/InterestRateTool.vue')
  },
  {
    path: '/tools/profit-loss-calculator',
    name: 'ProfitLossCalculatorTool',
    component: () => import('@/components/tools/finance/ProfitLossCalculatorTool.vue')
  }
];

export default financeRoutes;
