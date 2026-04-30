"use client";

import Modal from "./Modal";

export default function ConfirmDeleteModal({ t, onConfirm, onCancel }) {
  return (
    <Modal
      title={t.confirmDeleteTitle}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel}>
            {t.cancel}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {t.delete}
          </button>
        </>
      }
    >
      <p>{t.confirmDeleteText}</p>
    </Modal>
  );
}
