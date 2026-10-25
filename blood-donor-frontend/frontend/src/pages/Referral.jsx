
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { api } from "../services/api";

const Referral = () => {
  const [referral, setReferral] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  useEffect(() => {
    loadReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login to view your referral details.");
        return;
      }

      const [referralResponse, historyResponse] =
        await Promise.all([
          api.getMyReferral(token),
          api.getReferralHistory(token),
        ]);

      setReferral(referralResponse);
      setHistory(
        Array.isArray(historyResponse)
          ? historyResponse
          : historyResponse?.referrals || []
      );
    } catch (err) {
      console.error("Referral loading error:", err);
      setError(
        err.message ||
          "Unable to load referral details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const referralCode =
    referral?.referralCode ||
    referral?.code ||
    referral?.referral?.code ||
    "";

  const referralLink =
    referral?.referralLink ||
    referral?.link ||
    referral?.referral?.link ||
    (referralCode
      ? `${window.location.origin}/register?ref=${encodeURIComponent(
          referralCode
        )}`
      : "");

  const totalInvited =
    referral?.totalInvited ??
    referral?.stats?.totalInvited ??
    referral?.stats?.totalReferrals ??
    history.length;

  const successfulDonors =
    referral?.successfulDonors ??
    referral?.stats?.successfulDonors ??
    referral?.stats?.completedReferrals ??
    history.filter(
      (item) => item.status === "completed"
    ).length;

  const copyReferralLink = async () => {
    if (!referralLink) {
      alert("Referral link is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy link error:", err);

      window.prompt("Copy your referral link:", referralLink);
    }
  };

  const shareOnWhatsApp = () => {
    if (!referralLink) {
      alert("Referral link is not available.");
      return;
    }

    const message =
      "❤️ Join BloodAI - Blood Donor Finder!\n\n" +
      "Register using my referral link:\n" +
      referralLink +
      "\n\n" +
      "Help save lives by becoming a blood donor!";

    const whatsappUrl =
      "https://api.whatsapp.com/send?text=" +
      encodeURIComponent(message);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={styles.center}>
          <div style={styles.loader}></div>
          <p>Loading referral details...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroIcon}>❤️</div>

          <h1 style={styles.title}>
            Refer a Friend, <span style={styles.red}>Save Lives</span>
          </h1>

          <p style={styles.subtitle}>
            Invite your friends to join BloodAI and help connect
            blood donors with people who need them.
          </p>
        </section>

        {error && (
          <div style={styles.error}>
            {error}
            {!token && (
              <p>Please login first and open the Referral page again.</p>
            )}
            <button
              style={styles.retryButton}
              onClick={loadReferralData}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <>
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>
                Your Referral Link
              </h2>

              <p style={styles.description}>
                Share this link with your friends. When they register
                through it, your referral can be tracked.
              </p>

              <div style={styles.linkBox}>
                <input
                  aria-label="Referral link"
                  style={styles.linkInput}
                  value={referralLink}
                  readOnly
                  onFocus={(event) => event.target.select()}
                />

                <button
                  style={styles.copyButton}
                  onClick={copyReferralLink}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div style={styles.codeArea}>
                <span style={styles.codeLabel}>
                  Your Referral Code
                </span>
                <strong style={styles.code}>
                  {referralCode || "Not available"}
                </strong>
              </div>

              <button
                style={styles.whatsappButton}
                onClick={shareOnWhatsApp}
                disabled={!referralLink}
              >
                <span style={{ fontSize: 20 }}>☘</span>
                Share on WhatsApp
              </button>

              <p style={styles.note}>
                Note: If the link contains localhost, it will only
                work on your own computer. To share with other
                phones, deploy your website and use its public URL.
              </p>
            </section>

            <section style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <h2 style={styles.statNumber}>{totalInvited}</h2>
                <p style={styles.statLabel}>Total Referrals</p>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🩸</div>
                <h2 style={styles.statNumber}>{successfulDonors}</h2>
                <p style={styles.statLabel}>Successful Donors</p>
              </div>
            </section>

            <section style={styles.historyCard}>
              <h2 style={styles.cardTitle}>Referral History</h2>
              <p style={styles.description}>
                Track people who registered using your referral code.
              </p>

              {history.length === 0 ? (
                <div style={styles.empty}>
                  <div style={{ fontSize: 40 }}>👥</div>
                  <h3>No referrals yet</h3>
                  <p>
                    Share your referral link with friends to get started.
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>S.No</th>
                        <th style={styles.th}>Referral Code</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.map((item, index) => (
                        <tr
                          key={
                            item._id ||
                            item.id ||
                            `${item.referralCode}-${index}`
                          }
                        >
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>
                            {item.referralCode || referralCode || "-"}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.status,
                                ...(item.status === "completed"
                                  ? styles.completed
                                  : styles.pending),
                              }}
                            >
                              {item.status || "registered"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {item.createdAt
                              ? new Date(
                                  item.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
};

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "35px 20px 60px",
    fontFamily: "Arial, sans-serif",
    color: "#252525",
    minHeight: "70vh",
  },
  center: {
    minHeight: "55vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: "35px",
    height: "35px",
    border: "4px solid #f3d5d8",
    borderTop: "4px solid #dc3545",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  hero: {
    textAlign: "center",
    marginBottom: "35px",
  },
  heroIcon: {
    fontSize: "42px",
    marginBottom: "10px",
  },
  title: {
    fontSize: "clamp(28px, 4vw, 40px)",
    margin: "0 0 12px",
    fontWeight: 800,
  },
  red: {
    color: "#dc3545",
  },
  subtitle: {
    color: "#666",
    fontSize: "16px",
    lineHeight: 1.7,
    maxWidth: "650px",
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 5px 24px rgba(0,0,0,0.05)",
    marginBottom: "25px",
  },
  cardTitle: {
    fontSize: "23px",
    fontWeight: 750,
    margin: "0 0 10px",
  },
  description: {
    color: "#777",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "22px",
  },
  linkBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "22px",
  },
  linkInput: {
    flex: "1 1 280px",
    minWidth: 0,
    padding: "13px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#fafafa",
    color: "#333",
  },
  copyButton: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "8px",
    background: "#dc3545",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  codeArea: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    background: "#fff5f5",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  codeLabel: {
    fontSize: "13px",
    color: "#777",
  },
  code: {
    fontSize: "21px",
    color: "#c82333",
    letterSpacing: "1px",
    overflowWrap: "anywhere",
  },
  whatsappButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "9px",
    background: "#25D366",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  note: {
    marginTop: "16px",
    fontSize: "12px",
    lineHeight: 1.6,
    color: "#777",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },
  statCard: {
    textAlign: "center",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "14px",
    padding: "25px 15px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
  },
  statIcon: {
    fontSize: "30px",
  },
  statNumber: {
    fontSize: "34px",
    color: "#dc3545",
    margin: "12px 0 6px",
  },
  statLabel: {
    color: "#777",
    margin: 0,
    fontSize: "14px",
  },
  historyCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 5px 24px rgba(0,0,0,0.04)",
  },
  empty: {
    textAlign: "center",
    padding: "35px 10px",
    color: "#777",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "14px 12px",
    borderBottom: "2px solid #eee",
    fontSize: "13px",
    background: "#fafafa",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    textTransform: "capitalize",
  },
  completed: {
    background: "#e4f7eb",
    color: "#188044",
  },
  pending: {
    background: "#fff3cd",
    color: "#856404",
  },
  error: {
    padding: "18px",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#a3212b",
    textAlign: "center",
    marginBottom: "20px",
  },
  retryButton: {
    marginTop: "10px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "7px",
    background: "#dc3545",
    color: "#fff",
    cursor: "pointer",
  },
};

export default Referral;
