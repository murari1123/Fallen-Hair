/* ============================================
   JIGS V3 — Enquiry Review
   Structured review card with editable fields.
   Only shown when visitor explicitly reviews/submits.
   ============================================ */

import { useState } from 'react';
import styles from '../Jigs.module.css';

const FIELD_CONFIG = [
  { key: 'name', label: 'NAME', required: false },
  { key: 'email', label: 'EMAIL', required: true, type: 'email' },
  { key: 'phone', label: 'PHONE', required: false },
  { key: 'project_type', label: 'PROJECT TYPE', required: false },
  { key: 'project_description', label: 'PROJECT DETAILS', required: false, multiline: true },
  { key: 'creative_direction', label: 'CREATIVE DIRECTION', required: false, multiline: true },
  { key: 'deliverables', label: 'DELIVERABLES', required: false },
  { key: 'timeline', label: 'TIMELINE', required: false },
  { key: 'budget', label: 'BUDGET', required: false },
  { key: 'additional_notes', label: 'NOTES', required: false, multiline: true },
];

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function EnquiryReview({
  enquiryData,
  editingField,
  onEditField,
  onUpdateField,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}) {
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState('');

  const handleStartEdit = (field) => {
    setEditValue(enquiryData[field] || '');
    setEditError('');
    onEditField(field);
  };

  const handleSaveEdit = () => {
    if (!editingField) return;

    const config = FIELD_CONFIG.find(f => f.key === editingField);
    if (config?.type === 'email' && editValue.trim() && !EMAIL_REGEX.test(editValue.trim())) {
      setEditError('Please enter a valid email address.');
      return;
    }

    onUpdateField(editingField, editValue.trim());
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditError('');
    onEditField(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Validate required fields for submission
  const canSubmit = (() => {
    const email = (enquiryData.email || '').trim();
    if (!email || !EMAIL_REGEX.test(email)) return false;
    return true;
  })();

  return (
    <div className={styles.reviewSection}>
      <div className={styles.reviewHeader}>
        <span className={styles.reviewHeaderTitle}>ENQUIRY REVIEW</span>
        <span className={styles.reviewHeaderSub}>Review details before sending to Murari</span>
      </div>

      <div className={styles.reviewGrid}>
        {FIELD_CONFIG.map((config) => {
          const value = enquiryData[config.key];
          const isEditing = editingField === config.key;

          // Skip empty optional fields
          if (!value && !config.required && !isEditing) return null;

          return (
            <div key={config.key} className={styles.reviewItem}>
              <div className={styles.reviewItemHeader}>
                <span className={styles.reviewItemLabel}>
                  {config.label}
                  {config.required && !value && <span className={styles.requiredDot}> *</span>}
                </span>
                {!isEditing && (
                  <button
                    className={styles.editBtn}
                    onClick={() => handleStartEdit(config.key)}
                    aria-label={`Edit ${config.label.toLowerCase()}`}
                    type="button"
                  >
                    EDIT
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className={styles.reviewEditContainer}>
                  {config.multiline ? (
                    <textarea
                      className={styles.reviewEditInput}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={3}
                      maxLength={2000}
                      autoFocus
                    />
                  ) : (
                    <input
                      className={styles.reviewEditInput}
                      type={config.type || 'text'}
                      value={editValue}
                      onChange={(e) => { setEditValue(e.target.value); setEditError(''); }}
                      onKeyDown={handleKeyDown}
                      maxLength={200}
                      autoFocus
                    />
                  )}
                  {editError && <span className={styles.errorText}>{editError}</span>}
                  <div className={styles.reviewEditActions}>
                    <button className={styles.reviewEditSave} onClick={handleSaveEdit} type="button">SAVE</button>
                    <button className={styles.reviewEditCancel} onClick={handleCancelEdit} type="button">CANCEL</button>
                  </div>
                </div>
              ) : (
                <p className={styles.reviewItemValue}>{value || '—'}</p>
              )}
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <p className={styles.errorText}>{errorMessage}</p>
      )}

      <div className={styles.reviewActions}>
        <button
          className={styles.reviewBackBtn}
          onClick={onCancel}
          disabled={isSubmitting}
          type="button"
        >
          ← BACK TO CHAT
        </button>
        <button
          className={styles.submitEnquiryButton}
          onClick={onSubmit}
          disabled={isSubmitting || !canSubmit}
          title={!canSubmit ? 'Email address is required' : ''}
          type="button"
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT ENQUIRY →'}
        </button>
      </div>
    </div>
  );
}
