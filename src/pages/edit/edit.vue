<template>
  <view class="container">
    <view class="edit-hero">
      <view class="hero-deco d1"></view>
      <view class="hero-deco d2"></view>
      <view class="snow-badge s1"></view>
      <view class="snow-badge s2"></view>
      <view class="hero-inner">
        <text class="hero-back" @click="goBack">{{ text.back }}</text>
        <text class="hero-title">{{ isEditing ? text.editTitle : text.title }}</text>
        <text class="hero-sub">{{ isEditing ? text.editSubtitle : text.subtitle }}</text>
      </view>
    </view>

    <view class="content">
      <view class="form-card">
        <view class="form-item">
          <view class="label-row">
            <text class="label-text">{{ text.barcodeLabel }}</text>
          </view>
          <view class="input-box disabled">
            <text class="input-value">{{ code }}</text>
          </view>
        </view>

        <view class="form-item">
          <view class="label-row">
            <text class="label-text">{{ text.nameLabel }}</text>
            <text class="required">*</text>
          </view>
          <view class="input-shell">
            <input class="native-input" v-model="name" type="text" maxlength="40" :placeholder="text.namePlaceholder" placeholder-class="input-placeholder" />
          </view>
        </view>

        <view class="form-item">
          <view class="label-row">
            <text class="label-text">{{ text.priceLabel }}</text>
            <text class="required">*</text>
          </view>
          <view class="input-shell">
            <input class="native-input" v-model="price" type="digit" maxlength="10" :placeholder="text.pricePlaceholder" placeholder-class="input-placeholder" />
          </view>
        </view>

        <view class="form-item" v-if="!isEditing">
          <view class="label-row">
            <text class="label-text">{{ text.imageLabel }}</text>
            <text class="optional">{{ text.optional }}</text>
          </view>
          <view class="img-area">
            <view v-if="image" class="preview-wrap" @click="chooseImage">
              <image class="preview-img" :src="image" mode="aspectFill"></image>
              <view class="change-badge">
                <text class="change-text">{{ text.changeImage }}</text>
              </view>
            </view>
            <view v-else class="upload-box" @click="chooseImage">
              <text class="upload-icon">{{ text.uploadIcon }}</text>
              <text class="upload-hint">{{ text.imageHint }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="submit-area">
        <view class="submit-btn" @click="saveGoods">
          <text class="submit-text">{{ isEditing ? text.saveEditButton : text.saveButton }}</text>
        </view>
        <view v-if="isEditing" class="delete-btn" @click="confirmDeleteGoods">
          <text class="delete-text">{{ text.deleteButton }}</text>
        </view>
        <view class="cancel-btn" @click="goBack">
          <text class="cancel-text">{{ text.cancelButton }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { deleteGoods as removeGoods, getGoodsByBarcode, saveGoods as persistGoods } from '../../utils/goods-store';

const text = Object.freeze({
  back: '返回',
  title: '商品录入',
  editTitle: '编辑商品',
  subtitle: '请填写以下商品信息并保存到本地库',
  editSubtitle: '修改商品名称或价格后保存到本地库',
  barcodeLabel: '商品条形码',
  nameLabel: '商品名称',
  namePlaceholder: '请输入商品名称',
  priceLabel: '商品售价',
  pricePlaceholder: '如：3.50',
  imageLabel: '商品图片',
  optional: '(选填)',
  uploadIcon: '+',
  changeImage: '更换图片',
  imageHint: '拍照或从相册选择',
  saveButton: '保存到商品库',
  saveEditButton: '保存修改',
  cancelButton: '取消返回',
  deleteButton: '删除商品',
  deleteTitle: '删除商品',
  deleteContent: '确定要删除此商品吗？',
  deleteConfirm: '是',
  deleteCancel: '否',
  deleteSuccess: '商品已删除',
  deleteFailed: '删除失败',
  loadFailed: '读取商品失败',
  emptyName: '商品名称不能为空',
  invalidPrice: '请输入有效价格',
  saveSuccess: '保存成功',
  saveFailed: '保存失败'
});

const code = ref('');
const name = ref('');
const price = ref('');
const image = ref('');
const isEditing = ref(false);

watch(price, (value) => {
  const normalized = normalizePriceInput(value);

  if (normalized !== value) {
    price.value = normalized;
  }
});

onLoad((options) => {
  if (!options.code) return;

  code.value = options.code;
  void loadSavedGoods();
});

function normalizePriceInput(value) {
  let next = String(value ?? '').replace(/[^\d.]/g, '');
  const dotIndex = next.indexOf('.');

  if (dotIndex !== -1) {
    next = next.slice(0, dotIndex + 1) + next.slice(dotIndex + 1).replace(/\./g, '');
  }

  if (next.startsWith('.')) {
    next = `0${next}`;
  }

  const parts = next.split('.');

  if (parts[1] !== undefined) {
    next = `${parts[0]}.${parts[1].slice(0, 2)}`;
  }

  return next.slice(0, 10);
}

function normalizePriceForSave(value) {
  const normalized = normalizePriceInput(value).replace(/\.$/, '');

  if (!normalized) {
    return '';
  }

  const num = Number(normalized);

  if (!Number.isFinite(num) || num < 0) {
    return '';
  }

  return num.toFixed(2);
}

async function loadSavedGoods() {
  try {
    const savedItem = await getGoodsByBarcode(code.value);

    if (!savedItem) {
      isEditing.value = false;
      return;
    }

    isEditing.value = true;
    name.value = savedItem.name || '';
    price.value = normalizePriceInput(savedItem.price || '');
    image.value = savedItem.image || '';
  } catch (error) {
    uni.showToast({ title: text.loadFailed, icon: 'none' });
  }
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      image.value = res.tempFilePaths[0];
    }
  });
}

async function saveGoods() {
  const normalizedName = (name.value || '').trim();
  const normalizedPrice = normalizePriceForSave(price.value);

  if (!normalizedName) {
    return uni.showToast({ title: text.emptyName, icon: 'none' });
  }

  if (!normalizedPrice) {
    return uni.showToast({ title: text.invalidPrice, icon: 'none' });
  }

  name.value = normalizedName;
  price.value = normalizedPrice;

  try {
    await persistGoods({
      barcode: code.value,
      name: normalizedName,
      price: normalizedPrice,
      image: image.value || ''
    });

    uni.showToast({ title: text.saveSuccess, icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch (error) {
    uni.showToast({ title: text.saveFailed, icon: 'none' });
  }
}

function confirmDeleteGoods() {
  if (!isEditing.value || !code.value) {
    return;
  }

  uni.showModal({
    title: text.deleteTitle,
    content: text.deleteContent,
    confirmText: text.deleteConfirm,
    cancelText: text.deleteCancel,
    success: async (res) => {
      if (!res.confirm) {
        return;
      }

      try {
        await removeGoods(code.value);
        uni.showToast({ title: text.deleteSuccess, icon: 'success' });
        setTimeout(() => uni.navigateBack(), 600);
      } catch (error) {
        uni.showToast({ title: text.deleteFailed, icon: 'none' });
      }
    }
  });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.container { background: linear-gradient(180deg, #f7e7d7 0%, #fff8f0 100%); min-height: 100vh; }
.edit-hero { position: relative; background: linear-gradient(135deg, #c9783e 0%, #9d4e29 100%); padding: 60rpx 40rpx 80rpx; border-radius: 0 0 50rpx 50rpx; overflow: hidden; }
.hero-deco { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.14); }
.snow-badge { position: absolute; border-radius: 50%; border: 2rpx solid rgba(255,241,229,0.4); background: rgba(255,241,229,0.16); }
.s1 { width: 34rpx; height: 34rpx; top: 76rpx; right: 162rpx; }
.s2 { width: 18rpx; height: 18rpx; top: 132rpx; right: 114rpx; }
.d1 { width: 200rpx; height: 200rpx; top: -60rpx; right: -40rpx; }
.d2 { width: 120rpx; height: 120rpx; bottom: -20rpx; left: 50rpx; }
.hero-inner { position: relative; z-index: 2; display: flex; flex-direction: column; }
.hero-back { color: rgba(255,255,255,0.8); font-size: 28rpx; margin-bottom: 10rpx; }
.hero-title { color: #fff; font-size: 42rpx; font-weight: bold; }
.hero-sub { color: rgba(255,255,255,0.7); font-size: 24rpx; margin-top: 10rpx; }
.content { padding: 0 30rpx 40rpx; margin-top: -30rpx; position: relative; z-index: 5; }
.form-card { position: relative; overflow: hidden; background: radial-gradient(circle at top right, rgba(255,255,255,0.94), transparent 34%), linear-gradient(150deg, rgba(255,251,247,0.98), rgba(248,236,222,0.94)); border-radius: 30rpx; padding: 30rpx 36rpx; border: 1rpx solid rgba(224, 190, 155, 0.36); box-shadow: 0 12rpx 34rpx rgba(152,104,68,0.12), inset 0 1rpx 0 rgba(255,255,255,0.9); }
.form-card::before { content: ''; position: absolute; top: 0; left: 24rpx; right: 24rpx; height: 8rpx; border-radius: 0 0 999rpx 999rpx; background: linear-gradient(90deg, rgba(214, 151, 97, 0.2), rgba(214, 151, 97, 0.72), rgba(214, 151, 97, 0.2)); }
.form-item { margin-bottom: 36rpx; }
.form-item:last-child { margin-bottom: 10rpx; }
.label-row { display: flex; align-items: center; margin-bottom: 14rpx; }
.label-text { font-size: 28rpx; color: #333; font-weight: 600; }
.required { color: #ff3b30; font-size: 28rpx; margin-left: 6rpx; }
.optional { color: #b08a6f; font-size: 24rpx; margin-left: 8rpx; }
.input-box { background: #fff5ec; padding: 20rpx 24rpx; border-radius: 16rpx; }
.input-box.disabled { opacity: 0.7; }
.input-value { font-size: 30rpx; color: #999; font-family: monospace; }
.input-shell { background: #fff5ec; border-radius: 16rpx; padding: 20rpx 24rpx; }
.native-input { width: 100%; height: 44rpx; font-size: 30rpx; color: #333; }
.input-placeholder { color: #ba977d; }
.img-area { margin-top: 4rpx; }
.upload-box { width: 240rpx; height: 240rpx; background: linear-gradient(135deg, #fff8f1, #f7e7d7); border: 3rpx dashed #e1b792; border-radius: 20rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.upload-icon { font-size: 56rpx; margin-bottom: 10rpx; color: #c5763c; line-height: 1; }
.upload-hint { font-size: 22rpx; color: #a7856b; }
.preview-wrap { position: relative; width: 240rpx; height: 240rpx; border-radius: 20rpx; overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08); }
.preview-img { width: 100%; height: 100%; }
.change-badge { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); padding: 10rpx 0; text-align: center; }
.change-text { color: #fff; font-size: 22rpx; }
.submit-area { margin-top: 50rpx; }
.submit-btn { background: linear-gradient(135deg, #e1a367 0%, #be6730 100%); height: 100rpx; border-radius: 50rpx; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 25rpx rgba(190, 103, 48, 0.26); margin-bottom: 24rpx; }
.submit-btn:active { transform: scale(0.97); }
.submit-text { color: #fff; font-size: 32rpx; font-weight: bold; }
.delete-btn { height: 90rpx; border-radius: 50rpx; display: flex; align-items: center; justify-content: center; background: rgba(201, 71, 71, 0.1); border: 2rpx solid rgba(201, 71, 71, 0.28); margin-bottom: 24rpx; }
.delete-text { color: #c94747; font-size: 28rpx; font-weight: 700; }
.cancel-btn { height: 90rpx; border-radius: 50rpx; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.92); border: 2rpx solid rgba(224, 190, 155, 0.62); }
.cancel-text { color: #999; font-size: 28rpx; }
</style>
