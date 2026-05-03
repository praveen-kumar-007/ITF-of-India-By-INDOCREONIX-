import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Award, Calendar, FileText, LogOut, 
  ShieldCheck, Phone, MapPin, Hash, Briefcase, 
  Dna, Home, CheckCircle2, PenTool, Download,
  ChevronRight, Users, Eye, XCircle, Clock, Info
} from 'lucide-react';
import './AthleteProfile.css';

const AthleteProfile = () => {
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    const savedAthlete = localStorage.getItem('athlete');
    const token = localStorage.getItem('athleteToken');

    if (!savedAthlete || !token) {
      navigate('/login');
      return;
    }

    const currentAthlete = JSON.parse(savedAthlete);
    
    // Fetch latest status from backend to prevent stale local data
    const syncStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/athlete/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
          // Update local data with latest status
          setAthlete(result.data);
          localStorage.setItem('athlete', JSON.stringify(result.data));
        } else {
          // If token invalid or user not found
          handleLogout();
        }
      } catch (error) {
        console.error("Status Sync Error:", error);
        // Fallback to local data if network fails
        setAthlete(currentAthlete);
      }
    };

    syncStatus();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('athlete');
    localStorage.removeItem('athleteToken');
    navigate('/login');
  };

  if (!athlete) return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Retrieving Official Record...</p>
    </div>
  );

  // 1. REJECTED STATUS VIEW
  if (athlete.status === 'rejected') {
    return (
      <div className="status-overlay rejected-overlay">
        <div className="status-modal premium-card fade-in">
          <div className="status-icon-wrap error">
            <XCircle size={60} />
          </div>
          <div className="status-content">
            <div className="status-header-brand">
              <img src="/logo.jpeg" alt="ITF Logo" />
              <h2>Application Rejected</h2>
            </div>
            <p className="status-msg">Your official athlete registration has been <strong>Rejected</strong> by the ITF of India Administrative Board.</p>
            <div className="notice-box danger">
               <ShieldCheck size={16} /> <span>No access to organizational benefits or credentials is granted for rejected profiles.</span>
            </div>
            <button onClick={handleLogout} className="btn-status-action btn-danger-outline">
              <LogOut size={18} /> Logout from Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PENDING STATUS VIEW
  if (athlete.status === 'pending') {
    return (
      <div className="status-overlay pending-overlay">
        <div className="status-modal premium-card fade-in">
          <div className="status-icon-wrap pending">
            <Clock size={60} />
          </div>
          <div className="status-content">
            <div className="status-header-brand">
              <img src="/logo.jpeg" alt="ITF Logo" />
              <h2>Verification Pending</h2>
            </div>
            <p className="status-msg">Your application is currently being reviewed by our verification team.</p>
            <div className="notice-box warning">
               <Info size={18} /> 
               <p>Please wait for <strong>1-2 days</strong> for complete verification. After successful verification, we will contact you via your registered email.</p>
            </div>
            <div className="support-hint">For urgent queries, contact ITF of India Trust support.</div>
            <button onClick={handleLogout} className="btn-status-action btn-outline">
              <LogOut size={18} /> Logout from Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="athlete-dashboard">
      <div className="dashboard-header-bg"></div>
      
      <div className="container main-layout">
        <nav className="sp-kabaddi-grid">
          <button className="sp-btn dashboard active">
            <User size={18} /> <span>Dashboard</span>
          </button>
          <button className="sp-btn results">
            <Award size={18} /> <span>Results</span>
          </button>
          <button className="sp-btn records">
            <FileText size={18} /> <span>Records</span>
          </button>
          <button onClick={handleLogout} className="sp-btn logout">
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </nav>

        {/* SIDEBAR: Official Identity */}
        <aside className="dashboard-sidebar">
          <div className="identity-card-premium">
            <div className="identity-top">
              <div className="identity-avatar">
                {(athlete.photo || athlete.photoUrl) ? (
                  <img src={athlete.photo || athlete.photoUrl} alt="Athlete" />
                ) : (
                  <User size={60} />
                )}
              </div>
            </div>
            
            <div className="identity-body">
              <h2>{athlete.fullName}</h2>
              <p className="reg-number">{athlete.registrationNumber}</p>
              <div className="status-pill approved">
                <CheckCircle2 size={12} /> Approved Member
              </div>
            </div>

            <div className="identity-footer">
              <div className="id-meta">
                <label>Discipline</label>
                <span>{athlete.discipline || athlete.sport || 'Verified'}</span>
              </div>
              <div className="id-meta">
                <label>Blood Group</label>
                <span>{athlete.bloodGroup || 'N/A'}</span>
              </div>
              <div className="id-meta">
                <label>State</label>
                <span>{athlete.state || 'India'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT: The Full Dossier */}
        <main className="dashboard-content">
          <div className="header-card-premium">
            <header className="content-header-premium">
              <div className="header-brand-wrap">
                <div className="header-logo-main">
                  <img src="/logo.jpeg" alt="ITF Logo" />
                </div>
                <div className="header-titles">
                  <h1>ITF of INDIA</h1>
                  <p>THE FIGHTER OF INDIA</p>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn-primary"><Download size={18} /> E-Card</button>
              </div>
            </header>
          </div>

          <section className="record-section">
            
            {/* 1. PERSONAL & BIOMETRIC */}
            <div className="data-sheet">
              <div className="sheet-header">
                <div className="header-icon"><User size={20} /></div>
                <h3>Candidate Personal Profile</h3>
              </div>
              
              <div className="sheet-grid">
                <div className="data-field">
                  <label>Full Legal Name</label>
                  <span className="value">{athlete.fullName}</span>
                </div>
                <div className="data-field">
                  <label>Gender</label>
                  <span className="value">{athlete.gender}</span>
                </div>
                <div className="data-field">
                  <label>Date of Birth</label>
                  <span className="value">{athlete.dob}</span>
                </div>
                {athlete.bloodGroup && (
                  <div className="data-field">
                    <label>Blood Group</label>
                    <span className="value">{athlete.bloodGroup}</span>
                  </div>
                )}
                <div className="data-field">
                  <label>Aadhar ID (Masked)</label>
                  <span className="value">XXXX XXXX {athlete.aadharNumber ? athlete.aadharNumber.slice(-4) : '####'}</span>
                </div>
              </div>
            </div>

            {/* 2. FAMILY & BACKGROUND */}
            {(athlete.fatherName || athlete.motherName || athlete.fatherOccupation || athlete.qualification) && (
              <div className="data-sheet">
                <div className="sheet-header">
                  <div className="header-icon"><Users size={20} /></div>
                  <h3>Parental & Background Profile</h3>
                </div>
                
                <div className="sheet-grid">
                  {athlete.fatherName && (
                    <div className="data-field">
                      <label>Father's Name</label>
                      <span className="value">{athlete.fatherName}</span>
                    </div>
                  )}
                  {athlete.fatherOccupation && (
                    <div className="data-field">
                      <label>Father's Occupation</label>
                      <span className="value">{athlete.fatherOccupation}</span>
                    </div>
                  )}
                  {athlete.motherName && (
                    <div className="data-field">
                      <label>Mother's Name</label>
                      <span className="value">{athlete.motherName}</span>
                    </div>
                  )}
                  {athlete.qualification && (
                    <div className="data-field">
                      <label>Educational Qualification</label>
                      <span className="value">{athlete.qualification}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. CONTACT & RESIDENCE */}
            <div className="data-sheet">
              <div className="sheet-header">
                <div className="header-icon"><MapPin size={20} /></div>
                <h3>Contact & Residential Profile</h3>
              </div>
              
              <div className="sheet-grid">
                <div className="data-field">
                  <label>Primary Email</label>
                  <span className="value">{athlete.email}</span>
                </div>
                <div className="data-field">
                  <label>Primary Mobile</label>
                  <span className="value">{athlete.contactNumber || athlete.phone}</span>
                </div>
                <div className="data-field full-row">
                  <label>Village / City / Address</label>
                  <span className="value">{athlete.address || athlete.villageCity}</span>
                </div>
                {athlete.po && (
                  <div className="data-field">
                    <label>Post Office (P.O.)</label>
                    <span className="value">{athlete.po}</span>
                  </div>
                )}
                {athlete.ps && (
                  <div className="data-field">
                    <label>Police Station (P.S.)</label>
                    <span className="value">{athlete.ps}</span>
                  </div>
                )}
                {athlete.block && (
                  <div className="data-field">
                    <label>Block</label>
                    <span className="value">{athlete.block}</span>
                  </div>
                )}
                <div className="data-field">
                  <label>District</label>
                  <span className="value">{athlete.district}</span>
                </div>
                <div className="data-field">
                  <label>State / Province</label>
                  <span className="value">{athlete.state}</span>
                </div>
                <div className="data-field">
                  <label>Pincode</label>
                  <span className="value">{athlete.pinCode || athlete.pincode}</span>
                </div>
              </div>
            </div>

            {/* 5. REGISTRATION & FINANCIAL RECORD */}
            {(athlete.transactionId || athlete.paymentProof) && (
              <div className="data-sheet">
                <div className="sheet-header">
                  <div className="header-icon"><ShieldCheck size={20} /></div>
                  <h3>Registration & Financial Record</h3>
                </div>
                
                <div className="sheet-grid">
                  {athlete.transactionId && (
                    <div className="data-field">
                      <label>Transaction ID / UTR</label>
                      <span className="value accent-blue">{athlete.transactionId}</span>
                    </div>
                  )}
                  <div className="data-field">
                    <label>Registration Status</label>
                    <span className="value status-text">OFFICIALLY VERIFIED</span>
                  </div>
                  
                  {athlete.paymentProof && (
                    <div className="doc-item-premium full-row" style={{marginTop: '20px'}}>
                      <label>Payment Proof Receipt</label>
                      <div className="doc-preview card-look">
                        <img src={athlete.paymentProof} alt="Payment Proof" className="doc-img-direct" />
                        <a href={athlete.paymentProof} target="_blank" rel="noreferrer" className="view-btn-overlay">
                           <Eye size={14} /> VIEW RECEIPT
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. SPORTING & COACHING */}
            <div className="data-sheet">
              <div className="sheet-header">
                <div className="header-icon"><Award size={20} /></div>
                <h3>Athletic & Organizational Profile</h3>
              </div>
              
              <div className="sheet-grid">
                <div className="data-field">
                  <label>Sports Discipline</label>
                  <span className="value">{athlete.sportsDiscipline || athlete.discipline || athlete.sport || 'Verified'}</span>
                </div>
                {athlete.weightCategory && (
                  <div className="data-field">
                    <label>Weight Category</label>
                    <span className="value">{athlete.weightCategory}</span>
                  </div>
                )}
                {athlete.clubName && (
                  <div className="data-field">
                    <label>Registered Club</label>
                    <span className="value">{athlete.clubName}</span>
                  </div>
                )}
                {athlete.coachName && (
                  <div className="data-field">
                    <label>Designated Coach</label>
                    <span className="value">{athlete.coachName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5. VERIFICATION DOCUMENTS (NO PAYMENT) */}
            <div className="data-sheet glass-sheet">
              <div className="sheet-header">
                <div className="header-icon"><FileText size={20} /></div>
                <h3>Identity Documents & Verification</h3>
              </div>
              
              <div className="doc-gallery">
                <div className="doc-item-premium">
                  <label>Official Signature</label>
                  <div className="sig-preview">
                    {(athlete.signature || athlete.signatureUrl) ? (
                      <img src={athlete.signature || athlete.signatureUrl} alt="Signature" />
                    ) : (
                      <span className="missing">No Signature</span>
                    )}
                  </div>
                </div>

                <div className="doc-item-premium">
                  <label>Aadhar Front Copy</label>
                  <div className="doc-preview card-look">
                    {athlete.aadharFront ? (
                      <>
                        <img src={athlete.aadharFront} alt="Aadhar Front" className="doc-img-direct" />
                        <a href={athlete.aadharFront} target="_blank" rel="noreferrer" className="view-btn-overlay">
                           <Eye size={14} /> FULL VIEW
                        </a>
                      </>
                    ) : (
                      <>
                        <Hash size={24} className="id-icon-bg" />
                        <span className="missing">NOT UPLOADED</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="doc-item-premium">
                  <label>Aadhar Back Copy</label>
                  <div className="doc-preview card-look">
                    {athlete.aadharBack ? (
                      <>
                        <img src={athlete.aadharBack} alt="Aadhar Back" className="doc-img-direct" />
                        <a href={athlete.aadharBack} target="_blank" rel="noreferrer" className="view-btn-overlay">
                           <Eye size={14} /> FULL VIEW
                        </a>
                      </>
                    ) : (
                      <>
                        <Hash size={24} className="id-icon-bg" />
                        <span className="missing">NOT UPLOADED</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="verification-seal-footer">
                <img src="/logo.jpeg" alt="ITF Seal" className="watermark-seal" />
                <div className="seal-meta">
                  <p className="status">VERIFIED BY ITF INDIA TRUST</p>
                  <p className="date">Record Status: ACTIVE</p>
                </div>
              </div>
            </div>

          </section>
        </main>
      </div>
    </div>
  );
};

export default AthleteProfile;
