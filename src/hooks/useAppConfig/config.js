export default [
  {
    key: 'orderType',
    values: [
      'NORMAL_GOODS',
      'NORMAL_PRESALE',
      'IMMEDIATE_REALIZATION',
      'CROSS_BORDER',
      'FAST_PLUS',
      'CONSIGNMENT',
      'WAREHOUSING',
      'FAST_GOODS',
      'FAST_PRESALE',
      'BRAND_DIRECT_SUPPLY',
      'OVERSEAS_GOODS',
      'LIMITED_TIME_DISCOUNT_ACTIVITY',
    ]
  },
  {
    key: 'orderStatus',
    values: [
      'WAIT_PAY',
      'PAYMENT_SUCCESS',
      'WAIT_PLATFORM_RECEIPT',
      'PLATFORM_RECEIPTED',
      'QUALITY_INSPECTION_PASSED',
      'APPRAISAL_PASSED',
      'WAIT_PLATFORM_DELIVER',
      'WAIT_BUYER_RECEIVE',
      'TRADE_SUCCESS',
      'TRADE_FAILED',
      'TRADE_CLOSE_SUCCESS',
    ]
  },
  {
    key: 'orderCloseType',
    values: [
      'TRADE_CLOSE',
      'PAY_TIMEOUT',
      'BUYER_CLOSE',
      'DELIVER_TIMEOUT',
      'QUALITY_NOT_PASSED',
      'PLATFORM_CANCEL',
      'SUPPLEMENT_TIMEOUT',
      'SUPPLEMENT_DISAGREE',
      'RETURN_CLOSE',
      'APPLY_REPLACEMENT',
      'RETURN_SELLER_CLOSE',
      'BLIND_BOX_RETRIEVED_TIMEOUT',
      'RETURNING'
    ]
  }
];