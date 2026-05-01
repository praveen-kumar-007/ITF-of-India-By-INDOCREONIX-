import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./Registration.css";

const stateDistrictMap = {
  "Andhra Pradesh": [
    "Anantapur",
    "Annamayya",
    "Anakapalli",
    "Bapatla",
    "Chittoor",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Krishna",
    "Kakinada",
    "Konaseema",
    "Kurnool",
    "Nandyal",
    "NTR",
    "Palnadu",
    "Parvathipuram Manyam",
    "Prakasam",
    "Sri Potti Sriramulu Nellore",
    "Srikakulam",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa",
    "Alluri Sitarama Raju",
  ],
  "Arunachal Pradesh": [
    "Tawang",
    "West Kameng",
    "East Kameng",
    "Papum Pare",
    "Kurung Kumey",
    "Upper Subansiri",
    "Lower Subansiri",
    "West Siang",
    "East Siang",
    "Upper Siang",
    "Siang",
    "Lower Siang",
    "Dibang Valley",
    "Lower Dibang Valley",
    "Lohit",
    "Namsai",
    "Changlang",
    "Tirap",
    "Longding",
  ],
  Assam: [
    "Baksa",
    "Barpeta",
    "Biswanath",
    "Bongaigaon",
    "Cachar",
    "Charaideo",
    "Chirang",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Dima Hasao",
    "Goalpara",
    "Golaghat",
    "Hojai",
    "Jorhat",
    "Kamrup",
    "Kamrup Metropolitan",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Majuli",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Sivasagar",
    "Sonitpur",
    "South Salmara-Mankachar",
    "Tinsukia",
    "Udalguri",
  ],
  Bihar: [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran",
  ],
  Chhattisgarh: [
    "Balod",
    "Baloda Bazar",
    "Balrampur",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Gariaband",
    "Janjgir-Champa",
    "Jashpur",
    "Kabirdham",
    "Kanker",
    "Kondagaon",
    "Korba",
    "Koriya",
    "Mahasamund",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sukma",
    "Surajpur",
    "Surguja",
  ],
  Goa: ["North Goa", "South Goa"],
  Gujarat: [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhoomi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panchmahal",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad",
  ],
  Haryana: [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurugram",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Nuh",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar",
  ],
  "Himachal Pradesh": [
    "Bilaspur",
    "Chamba",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Kullu",
    "Lahaul and Spiti",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Solan",
    "Una",
  ],
  Jharkhand: [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahibganj",
    "Seraikela Kharsawan",
    "Simdega",
    "West Singhbhum",
  ],
  Karnataka: [
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikkaballapur",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Ramanagara",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayapura",
    "Yadgir",
  ],
  Kerala: [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ],
  "Madhya Pradesh": [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Hoshangabad",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa",
    "Khargone",
    "Mandla",
    "Mandsaur",
    "Morena",
    "Narsinghpur",
    "Neemuch",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha",
  ],
  Maharashtra: [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ],
  Manipur: [
    "Bishnupur",
    "Chandel",
    "Churachandpur",
    "Imphal East",
    "Imphal West",
    "Jiribam",
    "Kakching",
    "Kamjong",
    "Kangpokpi",
    "Noney",
    "Pherzawl",
    "Senapati",
    "Tamenglong",
    "Tengnoupal",
    "Thoubal",
    "Ukhrul",
  ],
  Meghalaya: [
    "East Garo Hills",
    "West Garo Hills",
    "South Garo Hills",
    "North Garo Hills",
    "East Jaintia Hills",
    "West Jaintia Hills",
    "Ri Bhoi",
    "South West Garo Hills",
  ],
  Mizoram: [
    "Aizawl",
    "Champhai",
    "Hnahthial",
    "Khawzawl",
    "Kolasib",
    "Lawngtlai",
    "Lunglei",
    "Mamit",
    "Saiha",
    "Serchhip",
    "Saitual",
  ],
  Nagaland: [
    "Dimapur",
    "Kiphire",
    "Kohima",
    "Longleng",
    "Mokokchung",
    "Mon",
    "Niuland",
    "Peren",
    "Phek",
    "Shamator",
    "Tuensang",
    "Wokha",
    "Zunheboto",
  ],
  Odisha: [
    "Angul",
    "Balangir",
    "Balasore",
    "Bargarh",
    "Bhadrak",
    "Boudh",
    "Cuttack",
    "Deogarh",
    "Dhenkanal",
    "Gajapati",
    "Ganjam",
    "Jagatsinghpur",
    "Jajpur",
    "Jharsuguda",
    "Kalahandi",
    "Kandhamal",
    "Kendrapara",
    "Keonjhar",
    "Khordha",
    "Koraput",
    "Malkangiri",
    "Mayurbhanj",
    "Nabarangpur",
    "Nayagarh",
    "Nuapada",
    "Puri",
    "Rayagada",
    "Sambalpur",
    "Sonepur",
    "Sundargarh",
  ],
  Punjab: [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Mansa",
    "Moga",
    "Muktsar",
    "Nawanshahr",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "Sahibzada Ajit Singh Nagar",
    "Sangrur",
    "Tarn Taran",
  ],
  Rajasthan: [
    "Ajmer",
    "Alwar",
    "Banswara",
    "Baran",
    "Barmer",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Dholpur",
    "Dungarpur",
    "Ganganagar",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalor",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Kota",
    "Nagaur",
    "Pali",
    "Pratapgarh",
    "Rajsamand",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur",
  ],
  Sikkim: ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": [
    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kanniyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruppur",
    "Tirunelveli",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar",
  ],
  Telangana: [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalapally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Komaram Bheem",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal Malkajgiri",
    "Mulugu",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Siricilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal Rural",
    "Warangal Urban",
    "Yadadri Bhuvanagiri",
  ],
  Tripura: [
    "Dhalai",
    "Gomati",
    "Khowai",
    "North Tripura",
    "Sepahijala",
    "South Tripura",
    "Unakoti",
    "West Tripura",
  ],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Ayodhya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Firozabad",
    "Gautam Buddh Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kheri",
    "Kushinagar",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Raebareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi",
  ],
  Uttarakhand: [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi",
  ],
  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur",
  ],
  "Andaman and Nicobar Islands": [
    "North and Middle Andaman",
    "Nicobar",
    "South Andaman",
  ],
  Chandigarh: ["Chandigarh"],
  "Dadra & Nagar Haveli and Daman & Diu": [
    "Dadra & Nagar Haveli",
    "Daman",
    "Diu",
  ],
  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  "Jammu & Kashmir": [
    "Anantnag",
    "Bandipora",
    "Baramulla",
    "Budgam",
    "Doda",
    "Ganderbal",
    "Jammu",
    "Kulgam",
    "Kathua",
    "Kupwara",
    "Poonch",
    "Pulwama",
    "Rajouri",
    "Ramban",
    "Reasi",
    "Samba",
    "Shopian",
    "Srinagar",
    "Udhampur",
  ],
  Ladakh: ["Kargil", "Leh"],
  Lakshadweep: ["Lakshadweep"],
  Puducherry: ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};

const GalleryImages = [
  "WhatsApp Image 2026-04-30 at 11.14.33 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.33 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.34 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.34 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.35 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.35 PM (2).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.35 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.36 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.36 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.42 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.43 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.43 PM (2).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.43 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.44 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.44 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.45 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.45 PM (2).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.45 PM.jpeg",
];

const Registration = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedState, setSelectedState] = useState("");
  const [districtOptions, setDistrictOptions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [landscapeImages, setLandscapeImages] = useState([]);

  const handleStateChange = (event) => {
    const state = event.target.value;
    setSelectedState(state);
    setSelectedDistrict("");
    setDistrictOptions(stateDistrictMap[state] || []);
  };

  const stateOptions = Object.keys(stateDistrictMap);

  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      const loaded = [];
      for (const src of GalleryImages) {
        const img = new Image();
        img.src = `/club_image/${src}`;
        await new Promise((resolve) => {
          img.onload = () => {
            // Check if landscape (width > height)
            if (img.width > img.height) {
              loaded.push(src);
            }
            resolve();
          };
          img.onerror = resolve;
        });
      }
      if (isMounted) {
        // We duplicate the array to allow for seamless infinite scrolling
        setLandscapeImages([...loaded, ...loaded]);
      }
    };
    loadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="registration-page">
      {/* Registration Header */}
      <section className="registration-hero">
        <div className="hero-slider-bg">
          <div
            className="hero-slider-track"
            style={{
              animationDuration: `${landscapeImages.length * 3}s`,
            }}
          >
            {landscapeImages.map((img, idx) => (
              <img
                key={idx}
                src={`/club_image/${img}`}
                alt="ITF Training"
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className="hero-content-overlay container">
          <span className="section-tag" style={{ color: "white" }}>
            {t("registration.tag")}
          </span>
          <h1
            className="section-title"
            style={{
              color: "white",
              borderBottom: "none",
              paddingBottom: 0,
              marginBottom: "1rem",
            }}
          >
            {t("registration.title")}
          </h1>
          <p className="hero-desc">{t("registration.desc")}</p>
        </div>
      </section>

      <section className="registration-content section">
        <div className="container">
          <div className="registration-grid">
            {/* Form Area */}
            <div className="registration-form-container">
              <div className="form-steps">
                <div className={`step ${step >= 1 ? "active" : ""}`}>
                  1. {t("registration.step1")}
                </div>
                <div className={`step ${step >= 2 ? "active" : ""}`}>
                  2. {t("registration.step2")}
                </div>
                <div className={`step ${step >= 3 ? "active" : ""}`}>
                  3. {t("registration.step3")}
                </div>
              </div>

              <form
                className="advanced-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(3);
                }}
              >
                {step === 1 && (
                  <div className="form-section fade-in">
                    <h3>{t("registration.personal_info")}</h3>
                    <div className="input-group">
                      <div className="input-field">
                        <label>{t("registration.first_name")}</label>
                        <input
                          type="text"
                          placeholder={t("registration.first_name")}
                          required
                        />
                      </div>
                      <div className="input-field">
                        <label>{t("registration.last_name")}</label>
                        <input
                          type="text"
                          placeholder={t("registration.last_name")}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>{t("registration.dob")}</label>
                        <input type="date" required />
                      </div>
                      <div className="input-field">
                        <label>{t("registration.gender")}</label>
                        <select required>
                          <option value="">
                            {t("registration.select_gender")}
                          </option>
                          <option value="male">{t("registration.male")}</option>
                          <option value="female">
                            {t("registration.female")}
                          </option>
                          <option value="other">
                            {t("registration.other")}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="input-field full">
                      <label>{t("registration.email")}</label>
                      <input
                        type="email"
                        placeholder={t("registration.email")}
                        required
                      />
                    </div>

                    <div className="input-field full">
                      <label>{t("registration.phone")}</label>
                      <input type="tel" placeholder="+91" required />
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>{t("registration.state")}</label>
                        <select
                          value={selectedState}
                          onChange={handleStateChange}
                          required
                        >
                          <option value="">{t("registration.state")}</option>
                          {stateOptions.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="input-field">
                        <label>{t("registration.city")}</label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          disabled={!selectedState}
                          required
                        >
                          <option value="">
                            {selectedState
                              ? t("registration.select_district")
                              : t("registration.city")}
                          </option>
                          {districtOptions.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-premium form-next"
                      onClick={() => setStep(2)}
                    >
                      {t("registration.next")} →
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="form-section fade-in">
                    <h3>{t("registration.step2")}</h3>

                    <div className="input-field full">
                      <label>Primary Discipline</label>
                      <select required>
                        <option value="">Select Primary Sport</option>
                        <option value="Karate">Karate</option>
                        <option value="Kabaddi">Kabaddi</option>
                        <option value="Athletics">Athletics</option>
                        <option value="Wrestling">Wrestling</option>
                        <option value="Boxing">Boxing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="input-field full">
                      <label>Experience Level</label>
                      <select required>
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">
                          Intermediate (2-5 years)
                        </option>
                        <option value="advanced">
                          Advanced / State Level (5+ years)
                        </option>
                        <option value="national">
                          National / International
                        </option>
                      </select>
                    </div>

                    <div className="input-field full">
                      <label>
                        Previous Achievements / Certifications (Optional)
                      </label>
                      <textarea
                        rows="4"
                        placeholder="List your medals, belts, or notable tournament participations..."
                      ></textarea>
                    </div>

                    <div className="form-buttons">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setStep(1)}
                      >
                        ← {t("registration.back")}
                      </button>
                      <button type="submit" className="btn-premium form-next">
                        {t("registration.submit")}
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="form-section success-section fade-in">
                    <div className="success-icon">✓</div>
                    <h3>Registration Submitted</h3>
                    <p>
                      Thank you for registering with ITF OF INDIA. Your
                      application has been recorded in our national database.
                    </p>
                    <p>
                      An official representative will contact you at your
                      provided email shortly.
                    </p>
                    <button
                      type="button"
                      className="btn-premium"
                      onClick={() => setStep(1)}
                      style={{ marginTop: "2rem" }}
                    >
                      Register Another Athlete
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Information Sidebar */}
            <div className="registration-sidebar">
              <div className="sidebar-image-card">
                <img
                  src="/club_image/WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg"
                  alt="Athletes"
                />
                <div className="overlay-text">Shape Your Future</div>
              </div>

              <div className="info-card">
                <h4>Why Register?</h4>
                <ul>
                  <li>Access to national-level training camps</li>
                  <li>Official certification and grading</li>
                  <li>Opportunities to represent state/country</li>
                  <li>Expert coaching from recognized professionals</li>
                </ul>
              </div>

              <div className="info-card highlight">
                <h4>Need Help?</h4>
                <p>
                  If you face any issues during the registration process, please
                  reach out to our headquarters:
                </p>
                <p>📞 +91 9229502961</p>
                <p>📧 itfofindia2013@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;
