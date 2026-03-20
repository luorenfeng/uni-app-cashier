<template>
  <view class="container">
    <view class="hero">
      <view class="hero-deco d1"></view>
      <view class="hero-deco d2"></view>
      <view class="hero-card">
        <view>
          <text class="hero-title">{{ text.title }}</text>
          <text class="hero-subtitle">{{ text.countPrefix }} {{ orders.length }} {{ text.countSuffix }}</text>
        </view>
      </view>
    </view>

    <view class="content">
      <view v-if="orders.length" class="order-list">
        <view v-for="order in orders" :key="order.orderNo" class="order-card">
          <view class="order-head">
            <view class="order-meta">
              <text class="order-no">{{ order.orderNo }}</text>
              <text class="order-time">{{ formatOrderTime(order.createdAt) }}</text>
            </view>
            <view class="order-total-box">
              <text class="order-total-label">{{ text.totalLabel }}</text>
              <text class="order-total-price">￥{{ order.totalPrice }}</text>
            </view>
          </view>

          <view class="order-summary">
            <text class="order-summary-text">{{ text.itemCountPrefix }} {{ order.itemCount }} {{ text.itemCountSuffix }}</text>
          </view>

          <view class="item-list">
            <view v-for="item in order.items" :key="`${order.orderNo}-${item.barcode}`" class="item-row">
              <view class="item-main">
                <text class="item-name">{{ item.name }}</text>
                <text class="item-code">{{ item.barcode }}</text>
              </view>
              <view class="item-side">
                <text class="item-qty">x{{ item.quantity }}</text>
                <text class="item-line-total">￥{{ item.lineTotal }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-card">
        <text class="empty-title">{{ text.emptyTitle }}</text>
        <text class="empty-hint">{{ text.emptyHint }}</text>
        <view class="empty-btn" @click="goScan">
          <text class="empty-btn-text">{{ text.goScan }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getOrderList } from '../../utils/order-store';

const text = Object.freeze({
  title: '订单中心',
  countPrefix: '已结算',
  countSuffix: '单',
  totalLabel: '订单金额',
  itemCountPrefix: '共',
  itemCountSuffix: '件商品',
  emptyTitle: '还没有结算订单',
  emptyHint: '去扫码结算第一单吧',
  goScan: '去扫码',
  readFailed: '订单读取失败'
});

const orders = ref([]);

onShow(() => {
  void loadOrders();
});

async function loadOrders() {
  try {
    orders.value = await getOrderList();
  } catch (error) {
    orders.value = [];
    uni.showToast({ title: text.readFailed, icon: 'none' });
  }
}

function formatOrderTime(timestamp) {
  const date = new Date(Number(timestamp || 0));

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function goScan() {
  uni.switchTab({ url: '/pages/index/index' });
}
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: linear-gradient(180deg, #f7e7d7 0%, #fff8f0 100%); }
.hero { position: relative; padding: 30rpx 30rpx 0; overflow: hidden; }
.hero-deco { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.16); }
.d1 { width: 200rpx; height: 200rpx; top: -50rpx; right: -30rpx; }
.d2 { width: 140rpx; height: 140rpx; left: 50rpx; bottom: -20rpx; }
.hero-card { position: relative; z-index: 2; background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.9), transparent 34%), linear-gradient(150deg, rgba(255, 251, 247, 0.9), rgba(248, 236, 222, 0.82)); border-radius: 28rpx; padding: 26rpx 28rpx; border: 1rpx solid rgba(236, 205, 173, 0.52); box-shadow: 0 10rpx 26rpx rgba(103, 58, 29, 0.12), inset 0 1rpx 0 rgba(255, 255, 255, 0.72); }
.hero-title { display: block; font-size: 42rpx; font-weight: 700; color: #6e3820; }
.hero-subtitle { display: block; margin-top: 10rpx; font-size: 24rpx; color: #9b7357; }
.content { padding: 24rpx 30rpx 44rpx; }
.order-list { display: flex; flex-direction: column; gap: 20rpx; }
.order-card { background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.94), transparent 34%), linear-gradient(150deg, rgba(255, 251, 247, 0.98), rgba(248, 236, 222, 0.94)); border-radius: 28rpx; padding: 28rpx; border: 1rpx solid rgba(224, 190, 155, 0.38); box-shadow: 0 12rpx 28rpx rgba(152, 104, 68, 0.1), inset 0 1rpx 0 rgba(255, 255, 255, 0.88); }
.order-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24rpx; }
.order-meta { flex: 1; min-width: 0; }
.order-no { display: block; font-size: 28rpx; font-weight: 700; color: #4f321f; word-break: break-all; }
.order-time { display: block; margin-top: 8rpx; font-size: 22rpx; color: #9a7559; }
.order-total-box { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.order-total-label { font-size: 22rpx; color: #b08a6f; }
.order-total-price { font-size: 38rpx; font-weight: 700; color: #b35f2e; }
.order-summary { margin-top: 18rpx; padding: 16rpx 20rpx; border-radius: 20rpx; background: rgba(255, 244, 231, 0.9); }
.order-summary-text { font-size: 24rpx; color: #8e6548; }
.item-list { margin-top: 18rpx; display: flex; flex-direction: column; gap: 16rpx; }
.item-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; padding: 18rpx 20rpx; border-radius: 20rpx; background: rgba(255, 255, 255, 0.72); }
.item-main { flex: 1; min-width: 0; }
.item-name { display: block; font-size: 28rpx; color: #4f321f; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-code { display: block; margin-top: 8rpx; font-size: 21rpx; color: #a18066; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; flex-shrink: 0; }
.item-qty { font-size: 24rpx; color: #9a7559; }
.item-line-total { font-size: 30rpx; font-weight: 700; color: #b35f2e; }
.empty-card { margin-top: 40rpx; background: radial-gradient(circle at top, rgba(255, 255, 255, 0.95), transparent 36%), linear-gradient(160deg, rgba(255, 251, 247, 0.98), rgba(248, 236, 222, 0.94)); border-radius: 30rpx; padding: 100rpx 40rpx; display: flex; flex-direction: column; align-items: center; border: 1rpx solid rgba(224, 190, 155, 0.38); box-shadow: 0 10rpx 28rpx rgba(152, 104, 68, 0.1), inset 0 1rpx 0 rgba(255, 255, 255, 0.88); }
.empty-title { font-size: 34rpx; font-weight: 700; color: #4f321f; }
.empty-hint { margin-top: 12rpx; font-size: 24rpx; color: #a18066; }
.empty-btn { margin-top: 40rpx; padding: 20rpx 52rpx; border-radius: 999rpx; background: linear-gradient(135deg, #e1a367, #be6730); }
.empty-btn-text { color: #fff; font-size: 28rpx; font-weight: 700; }
</style>
