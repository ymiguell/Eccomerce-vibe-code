import { createCoupon } from '../../domain/entities/Coupon.js'

const mockCoupons = [
  { code: 'BEMVINDO10', type: 'percent', value: 10, description: '10% de desconto' },
  { code: 'VERAO20', type: 'fixed', value: 20, minSubtotal: 150, description: 'R$ 20 off acima de R$ 150' },
]

export class MockCouponRepository {
  async findByCode(code) {
    const data = mockCoupons.find((coupon) => coupon.code === code.trim().toUpperCase())
    return data ? createCoupon(data) : null
  }
}
