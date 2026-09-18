/* ============================================
   FALLEN HAIR — JIGS Admin Dashboard
   Private authenticated admin panel for managing
   project enquiries. Uses Supabase Auth + RLS.
   ============================================ */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './JigsAdmin.module.css';

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'ARCHIVED'];

export function JigsAdmin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  /* Login form */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* Enquiries data */
  const [enquiries, setEnquiries] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  /* Delete confirmation */
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* AI conversation messages state (V2) */
  const [messagesMap, setMessagesMap] = useState({});
  const [expandedTranscripts, setExpandedTranscripts] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});

  const toggleTranscript = async (id) => {
    if (expandedTranscripts[id]) {
      setExpandedTranscripts(prev => ({ ...prev, [id]: false }));
      return;
    }

    setExpandedTranscripts(prev => ({ ...prev, [id]: true }));

    if (!messagesMap[id]) {
      setLoadingMessages(prev => ({ ...prev, [id]: true }));
      const { data: msgList } = await supabase
        .from('enquiry_messages')
        .select('*')
        .eq('enquiry_id', id)
        .order('created_at', { ascending: true });

      setMessagesMap(prev => ({ ...prev, [id]: msgList || [] }));
      setLoadingMessages(prev => ({ ...prev, [id]: false }));
    }
  };

  /* Listen for auth state */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* Fetch enquiries when authenticated */
  const fetchEnquiries = useCallback(async () => {
    if (!session) return;
    setDataLoading(true);
    setDataError('');

    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setDataError('Unable to load enquiries. Your account may not have access.');
      setDataLoading(false);
      return;
    }

    setEnquiries(data || []);
    setDataLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchEnquiries();
    }
  }, [session, fetchEnquiries]);

  /* Sign in */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError('Invalid credentials. Please try again.');
    }

    setAuthLoading(false);
  };

  /* Sign out */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setEnquiries([]);
  };

  /* Update status */
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('enquiries')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setEnquiries(prev =>
        prev.map(e => e.id === id ? { ...e, status: newStatus } : e)
      );
    }
  };

  /* Delete enquiry */
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', id);

    if (!error) {
      setEnquiries(prev => prev.filter(e => e.id !== id));
    }
    setDeleteConfirm(null);
  };

  /* Format date */
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  /* Loading screen */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <span className={styles.loadingText}>LOADING...</span>
        </div>
      </div>
    );
  }

  /* Login screen */
  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.loginContainer}>
          <div className={styles.loginHeader}>
            <span className={styles.loginBrand}>FALLEN HAIR<span className={styles.dot}>.</span></span>
            <h1 className={styles.loginTitle}>JIGS ADMIN</h1>
            <p className={styles.loginSubtext}>Private studio dashboard</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSignIn}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="admin-email">EMAIL</label>
              <input
                id="admin-email"
                className={styles.fieldInput}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="admin-password">PASSWORD</label>
              <input
                id="admin-password"
                className={styles.fieldInput}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {authError && (
              <p className={styles.authError}>{authError}</p>
            )}

            <button
              className={styles.loginButton}
              type="submit"
              disabled={authLoading}
            >
              {authLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* Dashboard */
  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.dashboardBrand}>JIGS ADMIN</span>
            <span className={styles.enquiryCount}>{enquiries.length} enquir{enquiries.length === 1 ? 'y' : 'ies'}</span>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.refreshButton} onClick={fetchEnquiries} disabled={dataLoading}>
              REFRESH
            </button>
            <button className={styles.signOutButton} onClick={handleSignOut}>
              SIGN OUT
            </button>
          </div>
        </div>

        {/* Data loading */}
        {dataLoading && (
          <div className={styles.centered}>
            <span className={styles.loadingText}>LOADING ENQUIRIES...</span>
          </div>
        )}

        {/* Data error */}
        {dataError && (
          <div className={styles.errorBanner}>
            <p>{dataError}</p>
          </div>
        )}

        {/* Empty state */}
        {!dataLoading && !dataError && enquiries.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>○</span>
            <p className={styles.emptyText}>No enquiries yet.</p>
            <p className={styles.emptySubtext}>New project enquiries from JIGS will appear here.</p>
          </div>
        )}

        {/* Enquiry list */}
        {!dataLoading && enquiries.length > 0 && (
          <div className={styles.enquiryList}>
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className={styles.enquiryCard}>

                {/* Card header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <span className={styles.enquiryName}>{enquiry.name}</span>
                    <span className={styles.enquiryDate}>{formatDate(enquiry.created_at)}</span>
                  </div>
                  <div className={styles.cardHeaderRight}>
                    <select
                      className={`${styles.statusSelect} ${styles[`status${enquiry.status}`]}`}
                      value={enquiry.status}
                      onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                      aria-label="Change status"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Card body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>PROJECT</span>
                    <span className={styles.cardValue}>{enquiry.project_type || '—'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>EMAIL</span>
                    <a href={`mailto:${enquiry.email}`} className={styles.cardValueLink}>{enquiry.email}</a>
                  </div>
                  {enquiry.phone && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>PHONE</span>
                      <a href={`tel:${enquiry.phone}`} className={styles.cardValueLink}>{enquiry.phone}</a>
                    </div>
                  )}
                  {enquiry.project_description && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>DETAILS</span>
                      <span className={styles.cardValueWide}>{enquiry.project_description}</span>
                    </div>
                  )}
                  {enquiry.preferred_date && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>TIMELINE</span>
                      <span className={styles.cardValue}>{enquiry.preferred_date}</span>
                    </div>
                  )}
                  {enquiry.preferred_time && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>TIME</span>
                      <span className={styles.cardValue}>{enquiry.preferred_time}</span>
                    </div>
                  )}
                  {enquiry.budget && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>BUDGET</span>
                      <span className={styles.cardValue}>{enquiry.budget}</span>
                    </div>
                  )}
                  {enquiry.additional_message && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>NOTE</span>
                      <span className={styles.cardValueWide}>{enquiry.additional_message}</span>
                    </div>
                  )}

                  {/* AI Studio Brief Dossier (V2) */}
                  {enquiry.ai_summary && (
                    <div className={styles.aiBriefBox}>
                      <div className={styles.aiBriefHeader}>
                        <span className={styles.aiBriefLabel}>AI STUDIO BRIEF</span>
                        {enquiry.qualification_score && enquiry.qualification_score !== 'UNASSESSED' && (
                          <span className={`${styles.aiScoreBadge} ${styles['score' + enquiry.qualification_score]}`}>
                            {enquiry.qualification_score} READINESS
                          </span>
                        )}
                      </div>
                      <p className={styles.aiBriefText}>{enquiry.ai_summary}</p>
                    </div>
                  )}

                  {/* AI Conversation Transcript (V2) */}
                  <div className={styles.transcriptSection}>
                    <button
                      type="button"
                      className={styles.transcriptToggleBtn}
                      onClick={() => toggleTranscript(enquiry.id)}
                    >
                      {expandedTranscripts[enquiry.id] ? 'HIDE AI CHAT TRANSCRIPT ▲' : 'VIEW AI CHAT TRANSCRIPT ▼'}
                    </button>

                    {expandedTranscripts[enquiry.id] && (
                      <div className={styles.transcriptContainer}>
                        {loadingMessages[enquiry.id] ? (
                          <span className={styles.transcriptLoading}>Loading chat log...</span>
                        ) : !messagesMap[enquiry.id] || messagesMap[enquiry.id].length === 0 ? (
                          <span className={styles.transcriptEmpty}>No conversation turns recorded yet.</span>
                        ) : (
                          <div className={styles.transcriptList}>
                            {messagesMap[enquiry.id].map((msg) => (
                              <div
                                key={msg.id}
                                className={`${styles.transcriptRow} ${msg.sender === 'jigs' ? styles.transcriptJigs : styles.transcriptUser}`}
                              >
                                <span className={styles.transcriptSender}>{msg.sender.toUpperCase()}</span>
                                <p className={styles.transcriptText}>{msg.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div className={styles.cardFooter}>
                  {deleteConfirm === enquiry.id ? (
                    <div className={styles.deleteConfirm}>
                      <span className={styles.deleteConfirmText}>Delete this enquiry?</span>
                      <button className={styles.deleteConfirmYes} onClick={() => handleDelete(enquiry.id)}>
                        YES, DELETE
                      </button>
                      <button className={styles.deleteConfirmNo} onClick={() => setDeleteConfirm(null)}>
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <button className={styles.deleteButton} onClick={() => setDeleteConfirm(enquiry.id)}>
                      DELETE
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
