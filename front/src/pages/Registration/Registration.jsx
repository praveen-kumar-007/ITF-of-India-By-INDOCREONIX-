import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./Registration.css";

const stateDistrictMap = {
  "Andhra Pradesh": ["Anantapur", "Annamayya", "Anakapalli", "Bapatla", "Chittoor", "East Godavari", "Eluru", "Guntur", "Krishna", "Kakinada", "Konaseema", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Potti Sriramulu Nellore", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa", "Alluri Sitarama Raju"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Upper Subansiri", "Lower Subansiri", "West Siang", "East Siang", "Upper Siang", "Siang", "Lower Siang", "Dibang Valley", "Lower Dibang Valley", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "West Garo Hills", "South Garo Hills", "North Garo Hills", "East Jaintia Hills", "West Jaintia Hills", "Ri Bhoi", "South West Garo Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip", "Saitual"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Peren", "Phek", "Shamator", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalor", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruppur", "Tirunelveli", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalapally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Siricilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Firozabad", "Gautam Buddh Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["North and Middle Andaman", "Nicobar", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra & Nagar Haveli and Daman & Diu": ["Dadra & Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu & Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kulgam", "Kathua", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};

const sportsDisciplines = [
  "Karate", "Taekwondo", "Judo", "Wrestling", "Boxing", "Kickboxing", "Mixed Martial Arts",
  "Kabaddi", "Football", "Volleyball", "Basketball", "Cricket", "Handball", "Kho-Kho",
  "Athletics", "Archery", "Shooting", "Fencing", "Badminton", "Table Tennis", "Yoga Sports"
];

const Registration = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    dob: "",
    age: "",
    gender: "",
    bloodGroup: "",
    aadharNumber: "",
    sportsDiscipline: "",
    qualification: "",
    fatherOccupation: "",
    villageCity: "",
    po: "",
    ps: "",
    block: "",
    district: "",
    state: "",
    pinCode: "",
    contactNumber: "",
    photo: null,
    signature: null
  });

  const [registrationResult, setRegistrationResult] = useState(null);
  const receiptRef = useRef();

  // Age calculation logic
  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += (months < 0 ? 12 : 0);
    }
    
    if (days < 0) {
      const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += prevMonthLastDay;
      months--;
      if (months < 0) {
        months = 11;
        years--;
      }
    }

    return `${years} Years, ${months} Months, ${days} Days`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "dob") {
        newData.age = calculateAge(value);
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, [name]: event.target.result }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData(prev => ({ ...prev, state: state, district: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }
    
    // Generate Registration Number
    const regNo = `ITF/REG/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    setRegistrationResult({
      regNo: regNo,
      date: new Date().toLocaleDateString(),
      ...formData
    });
    setStep(4);
    window.scrollTo(0, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (step === 4 && registrationResult) {
    return (
      <div className="registration-page">
        <section className="registration-hero">
          <div className="hero-bg-banner no-print">
            <div className="banner-track">
              {["11.16.42 PM", "11.16.43 PM", "11.16.44 PM", "11.16.45 PM", "11.16.42 PM (1)"].map((suffix, i) => (
                <div className="bg-image-box" key={i}>
                  <img src={`/club_image/WhatsApp Image 2026-04-30 at ${suffix}.jpeg`} alt="" />
                </div>
              ))}
              {["11.16.42 PM", "11.16.43 PM", "11.16.44 PM", "11.16.45 PM", "11.16.42 PM (1)"].map((suffix, i) => (
                <div className="bg-image-box" key={`dup-${i}`}>
                  <img src={`/club_image/WhatsApp Image 2026-04-30 at ${suffix}.jpeg`} alt="" />
                </div>
              ))}
            </div>
            <div className="hero-overlay"></div>
          </div>
          <div className="container hero-content">
            <h1>Registration Successful</h1>
            <p className="hero-desc">Your application has been received and is being processed.</p>
          </div>
        </section>

        <div className="success-overlay">
          <div className="success-modal fade-in">
            <div className="success-icon">✓</div>
            <h2>Registration Successful!</h2>
            <p className="success-message">Thank you, <strong>{registrationResult.fullName}</strong>. Your athlete registration has been successfully recorded.</p>
            
            <div className="ref-box">
              <span>Your Reference ID</span>
              <div className="ref-id">{registrationResult.regNo}</div>
            </div>

            <div className="next-steps">
              <p>Please save this ID for future trials and documentation.</p>
            </div>

            <div className="modal-actions">
              <button className="btn-premium" onClick={() => setStep(1)}>Register Another</button>
              <button className="btn-outline" onClick={() => window.location.href = "/"}>Back to Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <section className="registration-hero">
        {/* Continuous Background Banner */}
        <div className="hero-bg-banner no-print">
          <div className="banner-track">
            {/* Horizontal oriented images from the collection */}
            {["11.16.42 PM", "11.16.43 PM", "11.16.44 PM", "11.16.45 PM", "11.16.42 PM (1)"].map((suffix, i) => (
              <div className="bg-image-box" key={i}>
                <img src={`/club_image/WhatsApp Image 2026-04-30 at ${suffix}.jpeg`} alt="" />
              </div>
            ))}
            {/* Repeat for seamless loop */}
            {["11.16.42 PM", "11.16.43 PM", "11.16.44 PM", "11.16.45 PM", "11.16.42 PM (1)"].map((suffix, i) => (
              <div className="bg-image-box" key={`dup-${i}`}>
                <img src={`/club_image/WhatsApp Image 2026-04-30 at ${suffix}.jpeg`} alt="" />
              </div>
            ))}
          </div>
          <div className="hero-overlay"></div>
        </div>

        <div className="container hero-content">
          <span className="section-tag">National Sports Portal</span>
          <h1>Athlete Registration</h1>
          <p className="hero-desc">Secure your professional athletic identity. Join the ITF OF INDIA to access national championships, training camps, and global opportunities.</p>
          <div className="fee-callout">Registration Fee: ₹500/- Only</div>
        </div>
      </section>

      <section className="registration-content section">
        <div className="container">
          <div className="registration-layout">
            <div className="registration-main">
              <div className="form-steps no-print">
                <div className={`step-item ${step === 1 ? "active" : ""}`}>
                  <span className="step-num">01</span>
                  <span className="step-label">Personal</span>
                </div>
                <div className={`step-item ${step === 2 ? "active" : ""}`}>
                  <span className="step-num">02</span>
                  <span className="step-label">Address</span>
                </div>
                <div className={`step-item ${step === 3 ? "active" : ""}`}>
                  <span className="step-num">03</span>
                  <span className="step-label">Sports</span>
                </div>
              </div>

              <form className="advanced-form registration-form-container fade-in" onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="form-section">
                    <h3>Personal Identity</h3>
                    <div className="input-group">
                      <div className="input-field">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="Full Name as per Aadhar" />
                      </div>
                      <div className="input-field">
                        <label>Father's Name</label>
                        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required placeholder="Father's Name" />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
                      </div>
                      <div className="input-field">
                        <label>Calculated Age</label>
                        <input type="text" name="age" value={formData.age} readOnly placeholder="Years, Months, Days" className="readonly-input" />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="input-field">
                        <label>Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} required>
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-field full">
                      <label>Aadhar Number (12 Digits)</label>
                      <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} required placeholder="0000 0000 0000" maxLength="12" />
                    </div>

                    <div className="form-footer-actions">
                      <button type="button" className="btn-premium" onClick={() => setStep(2)}>Next Step: Address Details →</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="form-section">
                    <h3>Contact & Residency</h3>
                    <div className="input-group">
                      <div className="input-field">
                        <label>Village / City</label>
                        <input type="text" name="villageCity" value={formData.villageCity} onChange={handleInputChange} required placeholder="Village or City" />
                      </div>
                      <div className="input-field">
                        <label>Post Office (P.O.)</label>
                        <input type="text" name="po" value={formData.po} onChange={handleInputChange} required placeholder="P.O." />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>Police Station (P.S.)</label>
                        <input type="text" name="ps" value={formData.ps} onChange={handleInputChange} required placeholder="P.S." />
                      </div>
                      <div className="input-field">
                        <label>Block</label>
                        <input type="text" name="block" value={formData.block} onChange={handleInputChange} required placeholder="Block Name" />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>State</label>
                        <select name="state" value={formData.state} onChange={handleStateChange} required>
                          <option value="">Select State</option>
                          {Object.keys(stateDistrictMap).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="input-field">
                        <label>District</label>
                        <select name="district" value={formData.district} onChange={handleInputChange} required disabled={!formData.state}>
                          <option value="">Select District</option>
                          {formData.state && stateDistrictMap[formData.state].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="input-field full">
                      <label>Pin Code</label>
                      <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} required placeholder="6 Digit Pin Code" maxLength="6" />
                    </div>

                    <div className="form-buttons">
                      <button type="button" className="btn-outline" onClick={() => setStep(1)}>← Previous</button>
                      <button type="button" className="btn-premium" onClick={() => setStep(3)}>Next Step: Sports & Uploads →</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="form-section">
                    <h3>Discipline & Credentials</h3>
                    <div className="input-group">
                      <div className="input-field">
                        <label>Sports Discipline</label>
                        <select name="sportsDiscipline" value={formData.sportsDiscipline} onChange={handleInputChange} required>
                          <option value="">Select Discipline</option>
                          {sportsDisciplines.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="input-field">
                        <label>Educational Qualification</label>
                        <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} required placeholder="e.g. 10th, Graduate" />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>Father's Occupation</label>
                        <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} required placeholder="Father's Occupation" />
                      </div>
                      <div className="input-field">
                        <label>Primary Contact Number</label>
                        <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required placeholder="10 Digit Number" maxLength="10" />
                      </div>
                    </div>

                    <div className="upload-grid">
                      <div className={`upload-card ${formData.photo ? 'has-file' : ''}`}>
                        <div className="card-icon">📷</div>
                        <div className="card-info">
                          <h4>Passport Photo</h4>
                          <p>Formal background, Max 2MB</p>
                        </div>
                        <div className="upload-action-area">
                          {formData.photo ? (
                            <div className="preview-container">
                              <img src={formData.photo} alt="Passport" />
                              <button type="button" className="change-file-btn" onClick={() => document.getElementById('photo-upload').click()}>
                                <span>Change Photo</span>
                              </button>
                            </div>
                          ) : (
                            <div className="upload-btn-wrapper">
                              <label htmlFor="photo-upload" className="btn-premium btn-small">
                                <span>Upload Photo</span>
                              </label>
                              <input type="file" id="photo-upload" name="photo" accept="image/*" onChange={handleFileChange} required style={{display: 'none'}} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`upload-card ${formData.signature ? 'has-file' : ''}`}>
                        <div className="card-icon">✍️</div>
                        <div className="card-info">
                          <h4>Athlete Signature</h4>
                          <p>Scanned copy on white paper</p>
                        </div>
                        <div className="upload-action-area">
                          {formData.signature ? (
                            <div className="preview-container">
                              <img src={formData.signature} alt="Signature" />
                              <button type="button" className="change-file-btn" onClick={() => document.getElementById('sig-upload').click()}>
                                <span>Change Signature</span>
                              </button>
                            </div>
                          ) : (
                            <div className="upload-btn-wrapper">
                              <label htmlFor="sig-upload" className="btn-premium btn-small">
                                <span>Upload Signature</span>
                              </label>
                              <input type="file" id="sig-upload" name="signature" accept="image/*" onChange={handleFileChange} required style={{display: 'none'}} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="payment-notice">
                      <p>Note: An administrative fee of <strong>₹500.00</strong> will be payable upon physical trial verification.</p>
                    </div>

                    <div className="form-buttons">
                      <button type="button" className="btn-outline" onClick={() => setStep(2)}>← Previous</button>
                      <button type="submit" className="btn-premium">Finalize Application & Get Receipt</button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="registration-sidebar no-print">
              <div className="info-card glass">
                <h4>Trust Documents</h4>
                <ul>
                  <li>Valid Government ID Required</li>
                  <li>Recent Passport Size Photo</li>
                  <li>Educational Credentials</li>
                  <li>Parental Consent (if Minor)</li>
                </ul>
              </div>
              <div className="info-card glass highlight">
                <h4>Support Center</h4>
                <p>Need help with registration?</p>
                <div className="support-link">support@itfindia.org</div>
                <div className="support-link">+91 98765 43210</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;
