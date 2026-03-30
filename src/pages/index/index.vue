<template>
  <view class="container">
    <view class="winter-ornament o1"></view>
    <view class="winter-ornament o2"></view>
    <view class="winter-ornament o3"></view>

    <view class="content" :class="{ 'content-with-summary': scannedGoodsList.length }">
      <view class="scan-card">
        <view class="scan-btn-circle" @click="startScan">
          <view class="scan-ring ring-outer"></view>
          <view class="scan-ring ring-inner"></view>
          <view class="scan-icon-box">
            <view class="scan-camera-icon">
              <view class="scan-camera-top"></view>
              <view class="scan-camera-body">
                <view class="scan-camera-lens"></view>
              </view>
            </view>
          </view>
        </view>
        <text class="scan-label">{{ text.scanLabel }}</text>
      </view>

      <view v-if="scannedGoodsList.length" class="goods-list">
        <view
          v-for="goods in scannedGoodsList"
          :key="goods.barcode"
          class="goods-card"
        >
          <view class="goods-header">
            <text class="goods-tag">{{ goods.source === 'custom' ? text.customTag : text.recordedTag }}</text>
          </view>
          <view class="goods-qty-stepper goods-qty-stepper-floating">
            <view class="goods-qty-btn" @click.stop="decreaseScannedGoods(goods.barcode)">
              <text class="goods-qty-btn-text">-</text>
            </view>
            <text class="goods-qty-value">{{ goods.quantity }}</text>
            <view class="goods-qty-btn goods-qty-btn-plus" @click.stop="increaseScannedGoods(goods.barcode)">
              <text class="goods-qty-btn-text">+</text>
            </view>
          </view>

          <view class="goods-body">
            <view class="goods-info">
              <text class="goods-name">{{ goods.name }}</text>
              <text class="goods-code">{{ goods.barcode }}</text>
              <view class="goods-price-row">
                <view class="goods-price-box">
                  <text class="goods-price-label">{{ text.priceLabel }}</text>
                  <text class="goods-price">{{ text.priceSymbol }}{{ goods.price }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!showScanner && scannedGoodsList.length" class="goods-summary-dock">
      <view class="goods-summary">
        <view class="summary-main">
          <view class="summary-copy">
            <text class="summary-label">已扫商品</text>
            <text class="summary-count">共 {{ scannedGoodsCount }} 件</text>
          </view>
          <view class="summary-total">
            <text class="summary-total-label">总价</text>
            <view class="summary-total-amount">
              <text class="summary-total-currency">￥</text>
              <text class="summary-total-price">{{ scannedTotalPrice }}</text>
            </view>
          </view>
        </view>
        <view
          class="summary-action"
          :class="{ 'summary-action-disabled': checkoutBusy }"
          @click="checkoutScannedGoods"
        >
          <text class="summary-action-text">{{ checkoutBusy ? text.checkoutLoading : text.checkoutButton }}</text>
        </view>
      </view>
    </view>

    <view class="editor-mask" v-if="editorVisible">
      <view class="editor-panel">
        <view class="editor-head">
          <view>
            <text class="editor-title">{{ text.editorTitle }}</text>
            <text class="editor-subtitle">{{ text.editorSubtitle }}</text>
          </view>
          <text class="editor-close" @click="closeEditor">×</text>
        </view>

        <view class="editor-form">
          <view class="editor-field">
            <text class="field-label">{{ text.barcodeLabel }}</text>
            <view class="field-box disabled">
              <text class="field-value">{{ editorCode }}</text>
            </view>
          </view>

          <view class="editor-field">
            <text class="field-label">{{ text.nameLabel }}</text>
            <view class="field-box">
              <input class="field-input" v-model="editorName" maxlength="40" :placeholder="text.namePlaceholder" placeholder-class="field-placeholder" />
            </view>
          </view>

          <view class="editor-field">
            <text class="field-label">{{ text.priceInputLabel }}</text>
            <view class="field-box">
              <input class="field-input" v-model="editorPrice" type="digit" maxlength="10" :placeholder="text.pricePlaceholder" placeholder-class="field-placeholder" />
            </view>
          </view>
        </view>

        <view class="editor-actions">
          <view class="editor-btn primary-btn" @click="saveScannedGoods">
            <text class="editor-btn-text primary-text">{{ text.saveButton }}</text>
          </view>
          <view class="editor-btn secondary-btn" @click="closeEditor">
            <text class="editor-btn-text secondary-text">{{ text.cancelButton }}</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { getGoodsByBarcode, saveGoods as persistGoods } from '../../utils/goods-store';
import { saveOrder as persistOrder } from '../../utils/order-store';

const text = Object.freeze({
  scanLabel: '点击开始扫码',
  scanSuccess: '已识别条码',
  scanFailed: '相机启动失败',
  scanLookupFailed: '商品查询失败',
  unsupportedBarcode: '仅支持69开头的商品条码，请继续扫描',
  cameraPermissionDenied: '未获得相机权限，无法开始扫码',
  cameraPermissionTitle: '需要相机权限',
  cameraPermissionContent: '扫码功能需要使用相机，请授权后继续。',
  cameraPermissionRetryConfirm: '继续授权',
  cameraPermissionSettingsContent: '相机权限已被永久拒绝，请前往系统设置重新开启后继续扫码。',
  cameraPermissionSettingsConfirm: '去设置',
  cameraPermissionCancel: '取消',
  cameraPermissionSettingsFailed: '无法打开系统设置',
  recordedTag: '已录入',
  customTag: '本地商品',
  priceLabel: '售价',
  priceSymbol: '￥',
  notFoundPrompt: '未找到商品，请补充信息',
  editorTitle: '录入新商品',
  editorSubtitle: '当前条码未收录，请直接补充商品信息',
  barcodeLabel: '商品条形码',
  nameLabel: '商品名称',
  namePlaceholder: '请输入商品名称',
  priceInputLabel: '商品售价',
  pricePlaceholder: '如：3.50',
  saveButton: '保存商品',
  cancelButton: '取消',
  emptyName: '商品名称不能为空',
  invalidPrice: '请输入有效价格',
  saveSuccess: '商品已保存',
  saveFailed: '商品保存失败',
  invalidBarcode: '条码识别不完整，请对准条形码重新扫描',
  checkoutButton: '结算',
  checkoutLoading: '结算中',
  checkoutSuccess: '订单已结算',
  checkoutFailed: '订单结算失败'
});

const scanBusy = ref(false);
const scannedGoodsList = ref([]);
const checkoutBusy = ref(false);
const lastScanHintAt = ref(0);
const scannedGoodsCount = computed(() => {
  return scannedGoodsList.value.reduce((sum, goods) => sum + normalizeScannedQuantity(goods.quantity), 0);
});
const scannedTotalPrice = computed(() => {
  const total = scannedGoodsList.value.reduce((sum, goods) => {
    const price = Number.parseFloat(String(goods?.price ?? '').replace(/[^\d.]/g, ''));
    const quantity = normalizeScannedQuantity(goods.quantity);
    return Number.isFinite(price) ? sum + (price * quantity) : sum;
  }, 0);

  return total.toFixed(2);
});

const editorVisible = ref(false);
const editorCode = ref('');
const editorName = ref('');
const editorPrice = ref('');

watch(editorPrice, (value) => {
  const normalized = normalizePriceInput(value);

  if (normalized !== value) {
    editorPrice.value = normalized;
  }
});

const SUPPORTED_BARCODE_PREFIX = '69';
const ANDROID_CAMERA_PERMISSION = 'android.permission.CAMERA';
const SCAN_RETRY_DELAY = 180;
const SCAN_HINT_THROTTLE_MS = 1200;

function resetEditorForm(barcode = '') {
  editorCode.value = barcode;
  editorName.value = '';
  editorPrice.value = '';
}

function openEditor(barcode) {
  resetEditorForm(barcode);
  editorVisible.value = true;
  uni.showToast({ title: text.notFoundPrompt, icon: 'none' });
}

function closeEditor() {
  editorVisible.value = false;
}

function normalizeScannedQuantity(value) {
  const quantity = Number.parseInt(String(value ?? '1'), 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function waitForPlusReady() {
  return new Promise((resolve) => {
    if (typeof plus !== 'undefined') {
      resolve();
      return;
    }

    const onReady = () => {
      document.removeEventListener('plusready', onReady);
      resolve();
    };

    document.addEventListener('plusready', onReady, false);
  });
}

function showScanHint(message) {
  const now = Date.now();

  if (now - lastScanHintAt.value < SCAN_HINT_THROTTLE_MS) {
    return;
  }

  lastScanHintAt.value = now;
  uni.showToast({ title: message, icon: 'none' });
}

function normalizeBarcodeForLookup(value) {
  const digits = String(value ?? '').replace(/\s+/g, '').replace(/[^\d]/g, '');
  const lookupCandidates = new Set();
  let primaryCode = digits;

  if (digits.length === 12) {
    primaryCode = `0${digits}`;
    lookupCandidates.add(primaryCode);
    lookupCandidates.add(digits);
  } else if (digits.length === 13) {
    lookupCandidates.add(digits);

    if (digits.startsWith('0')) {
      lookupCandidates.add(digits.slice(1));
    }
  } else if (digits.length === 14) {
    primaryCode = digits.slice(1);
    lookupCandidates.add(primaryCode);
  } else if (digits.length === 8) {
    lookupCandidates.add(digits);
  }

  return {
    primaryCode,
    lookupCandidates: Array.from(lookupCandidates),
    isValid: lookupCandidates.size > 0
  };
}

function requestAndroidPermissions(permissions) {
  return new Promise((resolve, reject) => {
    plus.android.requestPermissions(
      permissions,
      (event) => resolve(event || {}),
      (error) => reject(error)
    );
  });
}

function openAndroidAppSettings() {
  try {
    const mainActivity = plus.android.runtimeMainActivity();
    const Intent = plus.android.importClass('android.content.Intent');
    const Settings = plus.android.importClass('android.provider.Settings');
    const Uri = plus.android.importClass('android.net.Uri');
    const intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);

    intent.setData(Uri.parse(`package:${mainActivity.getPackageName()}`));
    mainActivity.startActivity(intent);
  } catch (error) {
    uni.showToast({ title: text.cameraPermissionSettingsFailed, icon: 'none' });
  }
}

function promptOpenCameraSettings() {
  return new Promise((resolve) => {
    uni.showModal({
      title: text.cameraPermissionTitle,
      content: text.cameraPermissionSettingsContent,
      confirmText: text.cameraPermissionSettingsConfirm,
      cancelText: text.cameraPermissionCancel,
      success: (res) => {
        if (res.confirm) {
          openAndroidAppSettings();
        }

        resolve(false);
      },
      fail: () => resolve(false)
    });
  });
}

async function ensureCameraPermission() {
  await waitForPlusReady();

  if (plus.os.name !== 'Android') {
    return true;
  }

  try {
    const result = await requestAndroidPermissions([ANDROID_CAMERA_PERMISSION]);

    if ((result.granted || []).includes(ANDROID_CAMERA_PERMISSION)) {
      return true;
    }

    if ((result.deniedAlways || []).includes(ANDROID_CAMERA_PERMISSION)) {
      return promptOpenCameraSettings();
    }

    if ((result.deniedPresent || []).includes(ANDROID_CAMERA_PERMISSION)) {
      const shouldRetry = await new Promise((resolve) => {
        uni.showModal({
          title: text.cameraPermissionTitle,
          content: text.cameraPermissionContent,
          confirmText: text.cameraPermissionRetryConfirm,
          cancelText: text.cameraPermissionCancel,
          success: (res) => resolve(Boolean(res.confirm)),
          fail: () => resolve(false)
        });
      });

      if (!shouldRetry) {
        return false;
      }

      const retryResult = await requestAndroidPermissions([ANDROID_CAMERA_PERMISSION]);

      if ((retryResult.granted || []).includes(ANDROID_CAMERA_PERMISSION)) {
        return true;
      }

      if ((retryResult.deniedAlways || []).includes(ANDROID_CAMERA_PERMISSION)) {
        return promptOpenCameraSettings();
      }

      uni.showModal({
        title: text.cameraPermissionTitle,
        content: text.cameraPermissionContent,
        confirmText: text.cameraPermissionRetryConfirm,
        cancelText: text.cameraPermissionCancel,
        showCancel: false
      });
      return false;
    }

    uni.showToast({ title: text.cameraPermissionDenied, icon: 'none' });
    return false;
  } catch (error) {
    uni.showToast({ title: text.cameraPermissionDenied, icon: 'none' });
    return false;
  }
}

function isSupportedBarcode(normalized) {
  const candidates = normalized.lookupCandidates.length
    ? normalized.lookupCandidates
    : [normalized.primaryCode];

  return candidates.some((code) => code.startsWith(SUPPORTED_BARCODE_PREFIX));
}

function upsertScannedGoods(goods) {
  const nextGoods = {
    ...goods,
    barcode: String(goods?.barcode || '').trim(),
    quantity: normalizeScannedQuantity(goods?.quantity)
  };

  if (!nextGoods.barcode) {
    return;
  }

  const existingIndex = scannedGoodsList.value.findIndex((item) => item.barcode === nextGoods.barcode);

  if (existingIndex === -1) {
    scannedGoodsList.value = [nextGoods, ...scannedGoodsList.value];
    return;
  }

  const currentItem = scannedGoodsList.value[existingIndex];
  const updatedItem = {
    ...currentItem,
    ...nextGoods
  };
  updatedItem.quantity = normalizeScannedQuantity(currentItem?.quantity) + nextGoods.quantity;

  const nextList = scannedGoodsList.value.filter((item) => item.barcode !== nextGoods.barcode);
  scannedGoodsList.value = [updatedItem, ...nextList];
}

function increaseScannedGoods(barcode) {
  scannedGoodsList.value = scannedGoodsList.value.map((item) => {
    if (item.barcode !== barcode) {
      return item;
    }

    return {
      ...item,
      quantity: normalizeScannedQuantity(item.quantity) + 1
    };
  });
}

function decreaseScannedGoods(barcode) {
  const nextList = [];

  scannedGoodsList.value.forEach((item) => {
    if (item.barcode !== barcode) {
      nextList.push(item);
      return;
    }

    const nextQuantity = normalizeScannedQuantity(item.quantity) - 1;

    if (nextQuantity > 0) {
      nextList.push({
        ...item,
        quantity: nextQuantity
      });
    }
  });

  scannedGoodsList.value = nextList;
}

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

async function handleScanResult(barcode) {
  const normalized = normalizeBarcodeForLookup(barcode);

  if (!normalized.isValid) {
    showScanHint(text.invalidBarcode);
    return { status: 'retry' };
  }

  if (!isSupportedBarcode(normalized)) {
    showScanHint(text.unsupportedBarcode);
    return { status: 'retry' };
  }

  try {
    for (const candidate of normalized.lookupCandidates) {
      const goods = await getGoodsByBarcode(candidate);

      if (goods) {
        uni.showToast({ title: text.scanSuccess, icon: 'success' });
        upsertScannedGoods(goods);
        closeEditor();
        return { status: 'matched' };
      }
    }

    openEditor(normalized.primaryCode);
    return { status: 'not_found' };
  } catch (error) {
    uni.showToast({ title: text.scanLookupFailed, icon: 'none' });
    return { status: 'error' };
  }
}

function startScan() {
  if (scanBusy.value) {
    return;
  }

  void startScanWithPermission();
}

async function startScanWithPermission() {
  const hasPermission = await ensureCameraPermission();

  if (!hasPermission) {
    return;
  }

  uni.scanCode({
    onlyFromCamera: true,
    scanType: ['barCode'],
    autoDecodeCharset: true,
    autoZoom: true,
    success: async (res) => {
      if (scanBusy.value) {
        return;
      }

      scanBusy.value = true;
      let status = 'error';

      try {
        const result = await handleScanResult(res.result);
        status = result?.status || 'error';
      } finally {
        scanBusy.value = false;
      }

      if (status === 'retry') {
        setTimeout(() => {
          if (!editorVisible.value) {
            startScan();
          }
        }, SCAN_RETRY_DELAY);
      }
    }
  });
}

async function saveScannedGoods() {
  const normalizedName = (editorName.value || '').trim();
  const normalizedPrice = normalizePriceForSave(editorPrice.value);

  if (!normalizedName) {
    return uni.showToast({ title: text.emptyName, icon: 'none' });
  }

  if (!normalizedPrice) {
    return uni.showToast({ title: text.invalidPrice, icon: 'none' });
  }

  editorName.value = normalizedName;
  editorPrice.value = normalizedPrice;

  try {
    await persistGoods({
      barcode: editorCode.value,
      name: normalizedName,
      price: normalizedPrice
    });

    upsertScannedGoods({
      barcode: editorCode.value,
      name: normalizedName,
      price: normalizedPrice,
      source: 'custom'
    });
    editorVisible.value = false;
    uni.showToast({ title: text.saveSuccess, icon: 'success' });
  } catch (error) {
    uni.showToast({ title: text.saveFailed, icon: 'none' });
  }
}

async function checkoutScannedGoods() {
  if (checkoutBusy.value || scannedGoodsList.value.length === 0) {
    return;
  }

  checkoutBusy.value = true;

  try {
    await persistOrder({
      items: scannedGoodsList.value,
      itemCount: scannedGoodsCount.value,
      totalPrice: scannedTotalPrice.value
    });

    scannedGoodsList.value = [];
    uni.showToast({ title: text.checkoutSuccess, icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/orders/orders' });
    }, 280);
  } catch (error) {
    uni.showToast({ title: text.checkoutFailed, icon: 'none' });
  } finally {
    checkoutBusy.value = false;
  }
}
</script>

<style lang="scss" scoped>
.container { background: linear-gradient(180deg, #f7e7d7 0%, #f8efe5 45%, #fff8f0 100%); min-height: 100vh; overflow: hidden; position: relative; }
.winter-ornament { position: absolute; border-radius: 50%; background: rgba(255, 247, 238, 0.6); border: 1rpx solid rgba(222, 181, 143, 0.55); backdrop-filter: blur(8rpx); }
.o1 { width: 200rpx; height: 200rpx; top: -40rpx; left: -60rpx; }
.o2 { width: 120rpx; height: 120rpx; top: 120rpx; right: 40rpx; }
.o3 { width: 160rpx; height: 160rpx; top: 420rpx; right: -40rpx; }
.content { padding: 30rpx; position: relative; z-index: 2; }
.content-with-summary { padding-bottom: calc(340rpx + var(--window-bottom, 0px)); }
.scan-card { position: relative; overflow: hidden; background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.95), transparent 30%), linear-gradient(145deg, rgba(255, 251, 246, 0.98), rgba(248, 236, 222, 0.94)); border-radius: 30rpx; padding: 60rpx 40rpx; display: flex; flex-direction: column; align-items: center; border: 1rpx solid rgba(224, 190, 155, 0.42); box-shadow: 0 18rpx 44rpx rgba(152, 104, 68, 0.12), inset 0 1rpx 0 rgba(255, 255, 255, 0.9); }
.scan-card::before { content: ''; position: absolute; top: 0; left: 26rpx; right: 26rpx; height: 8rpx; border-radius: 0 0 999rpx 999rpx; background: rgba(248, 236, 222, 0.94); }
.scan-card::after { content: ''; position: absolute; width: 180rpx; height: 180rpx; top: -70rpx; right: -50rpx; border-radius: 50%; background: radial-gradient(circle, rgba(245, 204, 168, 0.42) 0%, rgba(245, 204, 168, 0) 70%); }
.scan-btn-circle { position: relative; width: 220rpx; height: 220rpx; display: flex; align-items: center; justify-content: center; }
.scan-ring { position: absolute; border-radius: 50%; border: 4rpx solid rgba(210, 149, 95, 0.28); }
.ring-outer { width: 220rpx; height: 220rpx; animation: pulse 2s ease-in-out infinite; }
.ring-inner { width: 180rpx; height: 180rpx; border-color: rgba(242, 204, 170, 0.9); animation: pulse 2s ease-in-out 0.3s infinite; }
.scan-icon-box { width: 140rpx; height: 140rpx; background: linear-gradient(135deg, #fff7ef 0%, #f9dec2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10rpx 30rpx rgba(180, 118, 67, 0.18); z-index: 2; }
.scan-camera-icon { position: relative; width: 72rpx; height: 52rpx; display: flex; align-items: flex-end; justify-content: center; }
.scan-camera-top { position: absolute; top: 0; left: 16rpx; width: 24rpx; height: 12rpx; border-radius: 10rpx 10rpx 0 0; background: #8c4d28; }
.scan-camera-body { width: 72rpx; height: 42rpx; border-radius: 16rpx; background: linear-gradient(180deg, #ab6637, #8c4d28); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.18); }
.scan-camera-lens { width: 26rpx; height: 26rpx; border-radius: 50%; border: 5rpx solid #f8e0ca; box-sizing: border-box; }
@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.5; } }
.scan-label { font-size: 34rpx; font-weight: bold; color: #7c4627; margin-top: 30rpx; }
.goods-list { margin-top: 28rpx; display: flex; flex-direction: column; gap: 20rpx; }
.goods-summary-dock { position: fixed; left: 0; right: 0; bottom: calc(var(--window-bottom, 0px) + env(safe-area-inset-bottom)); padding: 0 30rpx 24rpx; z-index: 20; pointer-events: none; }
.goods-summary { background: linear-gradient(145deg, rgba(124, 70, 39, 0.96), rgba(163, 95, 54, 0.96)); border-radius: 28rpx; padding: 26rpx 30rpx; display: flex; flex-direction: column; gap: 22rpx; box-shadow: 0 14rpx 32rpx rgba(124, 70, 39, 0.18); pointer-events: auto; }
.summary-main { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.summary-copy { display: flex; flex-direction: column; gap: 8rpx; }
.summary-label { font-size: 24rpx; color: rgba(255, 243, 230, 0.82); }
.summary-count { font-size: 34rpx; font-weight: 700; color: #fff7ee; }
.summary-total { display: flex; flex-direction: column; align-items: flex-end; gap: 8rpx; }
.summary-total-label { font-size: 24rpx; color: rgba(255, 243, 230, 0.82); }
.summary-total-amount { min-width: 180rpx; display: flex; align-items: baseline; justify-content: flex-end; gap: 6rpx; white-space: nowrap; }
.summary-total-currency { font-size: 28rpx; line-height: 1; font-weight: 700; color: #fff; }
.summary-total-price { display: block; font-size: 42rpx; line-height: 1; font-weight: 700; color: #fff; }
.summary-action { height: 84rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.16); border: 1rpx solid rgba(255, 255, 255, 0.24); }
.summary-action-disabled { opacity: 0.68; }
.summary-action-text { font-size: 30rpx; font-weight: 700; color: #fff; }
.goods-card { position: relative; background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.96), transparent 34%), linear-gradient(150deg, rgba(255, 251, 247, 0.98), rgba(248, 236, 222, 0.94)); border-radius: 28rpx; padding: 24rpx 30rpx 28rpx; border: 1rpx solid rgba(224, 190, 155, 0.36); box-shadow: 0 14rpx 32rpx rgba(152, 104, 68, 0.11), inset 0 1rpx 0 rgba(255, 255, 255, 0.88); }
.goods-header { position: absolute; top: 20rpx; right: 24rpx; display: flex; align-items: center; justify-content: flex-end; }
.goods-tag { padding: 10rpx 18rpx; border-radius: 999rpx; background: rgba(196, 106, 51, 0.14); color: #b35f2e; font-size: 22rpx; }
.goods-body { display: block; }
.goods-info { display: flex; flex-direction: column; padding-right: 210rpx; }
.goods-name { font-size: 34rpx; font-weight: 700; color: #4f321f; line-height: 1.28; }
.goods-code { margin-top: 8rpx; font-size: 22rpx; color: #9a7559; font-family: monospace; }
.goods-price-row { margin-top: 12rpx; min-height: 64rpx; display: flex; align-items: center; gap: 16rpx; }
.goods-price-box { display: flex; align-items: baseline; gap: 12rpx; min-width: 0; min-height: 64rpx; }
.goods-qty-stepper { display: flex; align-items: center; gap: 10rpx; padding: 6rpx; border-radius: 999rpx; background: rgba(198, 109, 53, 0.08); }
.goods-qty-stepper-floating { position: absolute; right: 24rpx; bottom: 24rpx; }
.goods-qty-btn { min-width: 68rpx; height: 48rpx; padding: 0 16rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.92); border: 1rpx solid rgba(198, 109, 53, 0.16); }
.goods-qty-btn-plus { background: linear-gradient(135deg, #fff3e7, #f5ddc6); }
.goods-qty-btn-text { font-size: 22rpx; font-weight: 700; color: #b35f2e; }
.goods-qty-value { min-width: 28rpx; text-align: center; font-size: 24rpx; font-weight: 700; color: #7c4627; }
.goods-price-label { font-size: 24rpx; color: #b08a6f; }
.goods-price { font-size: 46rpx; font-weight: 700; color: #b35f2e; }
.editor-mask { position: fixed; inset: 0; background: rgba(62, 38, 24, 0.4); backdrop-filter: blur(6rpx); display: flex; align-items: center; justify-content: center; padding: 30rpx; z-index: 9998; }
.editor-panel { width: 100%; max-width: 680rpx; max-height: 90vh; overflow: auto; background: linear-gradient(160deg, rgba(255, 251, 247, 0.99), rgba(248, 236, 222, 0.96)); border-radius: 30rpx; padding: 34rpx; border: 1rpx solid rgba(224, 190, 155, 0.42); box-shadow: 0 24rpx 60rpx rgba(90, 53, 27, 0.18); }
.editor-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24rpx; }
.editor-title { display: block; font-size: 34rpx; font-weight: 700; color: #6f3d23; }
.editor-subtitle { display: block; margin-top: 10rpx; font-size: 24rpx; line-height: 1.5; color: #9a7559; }
.editor-close { font-size: 42rpx; line-height: 1; color: #b18163; padding: 4rpx 8rpx; }
.editor-form { margin-top: 28rpx; }
.editor-field { margin-bottom: 26rpx; }
.field-head { display: flex; align-items: center; gap: 10rpx; }
.field-label { display: block; margin-bottom: 12rpx; font-size: 28rpx; font-weight: 600; color: #4f321f; }
.field-box { background: #fff5ec; border-radius: 18rpx; padding: 20rpx 22rpx; }
.field-box.disabled { opacity: 0.72; }
.field-value { font-size: 28rpx; color: #9a7559; font-family: monospace; }
.field-input { width: 100%; height: 44rpx; font-size: 28rpx; color: #333; }
.field-placeholder { color: #ba977d; }
.editor-actions { margin-top: 18rpx; display: flex; flex-direction: column; gap: 18rpx; }
.editor-btn { height: 92rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; }
.primary-btn { background: linear-gradient(135deg, #e1a367 0%, #be6730 100%); box-shadow: 0 10rpx 22rpx rgba(190, 103, 48, 0.24); }
.secondary-btn { background: rgba(255, 255, 255, 0.92); border: 2rpx solid rgba(224, 190, 155, 0.62); }
.editor-btn-text { font-size: 30rpx; font-weight: 700; }
.primary-text { color: #fff; }
.secondary-text { color: #8e6d56; }
</style>
