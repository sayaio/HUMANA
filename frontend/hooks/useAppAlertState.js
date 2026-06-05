import { useState, useCallback, useRef } from 'react';
import InfoModal from '../components/InfoModal';
import CustomAlert from '../components/CustomAlert';

export const inferAlertType = (title, explicitType) => {
  if (explicitType === 'success' || explicitType === 'gagal') {
    return explicitType;
  }
  const t = String(title || '').toLowerCase();
  if (t.includes('sukses') || t.includes('berhasil')) {
    return 'success';
  }
  return 'gagal';
};

export function useAppAlertState() {
  const [info, setInfo] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'gagal',
  });
  const infoOnCloseRef = useRef(null);

  const [confirm, setConfirm] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'gagal',
  });
  const confirmOnConfirmRef = useRef(null);
  const confirmOnCancelRef = useRef(null);

  const closeInfo = useCallback(() => {
    setInfo(prev => ({ ...prev, visible: false }));
    const fn = infoOnCloseRef.current;
    infoOnCloseRef.current = null;
    fn?.();
  }, []);

  const showInfo = useCallback((title, message = '', options) => {
    let type = inferAlertType(title);
    let onClose;

    if (typeof options === 'string') {
      type = inferAlertType(title, options);
    } else if (options && typeof options === 'object') {
      type = inferAlertType(title, options.type);
      onClose = options.onClose;
    }

    infoOnCloseRef.current = onClose ?? null;
    setInfo({ visible: true, title, message, type });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, visible: false }));
    const fn = confirmOnCancelRef.current;
    confirmOnConfirmRef.current = null;
    confirmOnCancelRef.current = null;
    fn?.();
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, options = {}) => {
    confirmOnConfirmRef.current = onConfirm ?? null;
    confirmOnCancelRef.current = options.onCancel ?? null;
    setConfirm({
      visible: true,
      title,
      message,
      type: inferAlertType(title, options.type),
      options,
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const fn = confirmOnConfirmRef.current;
    setConfirm(prev => ({ ...prev, visible: false }));
    confirmOnConfirmRef.current = null;
    confirmOnCancelRef.current = null;
    fn?.();
  }, []);

  const AlertModals = useCallback(
    () => (
      <>
        <InfoModal
          visible={info.visible}
          title={info.title}
          message={info.message}
          type={info.type}
          onClose={closeInfo}
        />
        <CustomAlert
          visible={confirm.visible}
          type={confirm.type}
          title={confirm.title}
          message={confirm.message}
          isConfirmation
          onClose={closeConfirm}
          onConfirm={handleConfirm}
          options={confirm.options}
        />
      </>
    ),
    [info, confirm, closeInfo, closeConfirm, handleConfirm],
  );

  return { showInfo, showConfirm, closeInfo, AlertModals };
}
