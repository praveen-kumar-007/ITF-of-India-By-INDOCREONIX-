import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import { QRCodeSVG } from "qrcode.react";
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

const sportsDisciplines = [
  "Karate",
  "Taekwondo",
  "Judo",
  "Wrestling",
  "Boxing",
  "Kickboxing",
  "Mixed Martial Arts",
  "Kabaddi",
  "Football",
  "Volleyball",
  "Basketball",
  "Cricket",
  "Handball",
  "Kho-Kho",
  "Athletics",
  "Archery",
  "Shooting",
  "Fencing",
  "Badminton",
  "Table Tennis",
  "Yoga Sports",
];

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    signature: null,
    aadharFront: null,
    aadharBack: null,
    email: "",
    isEmailVerified: false,
    otpValue: ["", "", "", "", "", ""],
    otpSent: false,
    toast: { message: "", type: "" },
    transactionId: "",
    paymentProof: null,
    loading: false,
    kitSize: "",
    parentContactNumber: "", // New Field
    paymentSettings: {
      upiId: "",
      merchantName: "",
      amount: "500",
    },
  });

  const [files, setFiles] = useState({
    photo: null,
    signature: null,
    aadharFront: null,
    aadharBack: null,
    paymentProof: null,
  });

  const [previews, setPreviews] = useState({
    photo: null,
    signature: null,
    aadharFront: null,
    aadharBack: null,
    paymentProof: null,
  });

  const [imageMeta, setImageMeta] = useState({
    photo: null,
    signature: null,
    aadharFront: null,
    aadharBack: null,
    paymentProof: null,
  });

  const [registrationResult, setRegistrationResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [cropImage, setCropImage] = useState(null);
  const [cropField, setCropField] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    if (step === 5 && registrationResult) {
      document.body.classList.add("hide-footer");
    } else {
      document.body.classList.remove("hide-footer");
    }

    return () => {
      document.body.classList.remove("hide-footer");
    };
  }, [step, registrationResult]);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/payment`);
      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          paymentSettings: result.data,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch payment settings");
    }
  };

  // --- PERSISTENCE LOGIC (Draft Caching) ---
  useEffect(() => {
    const savedDraft = localStorage.getItem("itf_reg_draft");
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        const { previews: savedPreviews, imageMeta: savedImageMeta, ...draftFields } =
          parsedDraft;

        setFormData((prev) => ({
          ...prev,
          ...draftFields,
          loading: false, // Reset non-persistent states
          toast: { message: "", type: "" },
        }));

        if (savedPreviews) {
          setPreviews(savedPreviews);
        }

        if (savedImageMeta) {
          setImageMeta(savedImageMeta);
        }

        if (savedPreviews) {
          const restoredFiles = {};
          Object.keys(savedPreviews).forEach((key) => {
            const preview = savedPreviews[key];
            if (!preview) return;
            const filename = savedImageMeta?.[key]?.name || `${key}-image.jpeg`;
            restoredFiles[key] = dataURLtoFile(preview, filename);
          });
          if (Object.keys(restoredFiles).length > 0) {
            setFiles((prev) => ({ ...prev, ...restoredFiles }));
          }
        }

        const savedStep = localStorage.getItem("itf_reg_step");
        if (savedStep) setStep(parseInt(savedStep));
      } catch (err) {
        console.error("Failed to restore draft:", err);
      }
    }
  }, []);

  useEffect(() => {
    // Only save persistent fields (exclude files and ephemeral states)
    const {
      photo,
      signature,
      aadharFront,
      aadharBack,
      paymentProof,
      loading,
      toast,
      otpValue,
      otpSent,
      ...persistentData
    } = formData;

    const draftToSave = {
      ...persistentData,
      previews,
      imageMeta,
    };

    localStorage.setItem("itf_reg_draft", JSON.stringify(draftToSave));
    if (step < 5) {
      localStorage.setItem("itf_reg_step", step.toString());
    }
  }, [formData, step]);

  // Fallback: If step is 5 but no registrationResult, reset to step 1
  useEffect(() => {
    if (step === 5 && !registrationResult) {
      setStep(1);
    }
  }, [step, registrationResult]);

  const clearDraft = () => {
    localStorage.removeItem("itf_reg_draft");
    localStorage.removeItem("itf_reg_step");
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const resetRegistrationForm = (
    paymentSettings = { upiId: "", merchantName: "", amount: "500" },
  ) => {
    setFormData({
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
      signature: null,
      aadharFront: null,
      aadharBack: null,
      email: "",
      isEmailVerified: false,
      otpValue: ["", "", "", "", "", ""],
      otpSent: false,
      toast: { message: "", type: "" },
      transactionId: "",
      paymentProof: null,
      loading: false,
      kitSize: "",
      parentContactNumber: "",
      paymentSettings,
    });

    setFiles({
      photo: null,
      signature: null,
      aadharFront: null,
      aadharBack: null,
      paymentProof: null,
    });

    setPreviews({
      photo: null,
      signature: null,
      aadharFront: null,
      aadharBack: null,
      paymentProof: null,
    });

    setImageMeta({
      photo: null,
      signature: null,
      aadharFront: null,
      aadharBack: null,
      paymentProof: null,
    });

    setErrors({});
    setCropImage(null);
    setCropField(null);
  };
  // --- END PERSISTENCE ---

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
      months += months < 0 ? 12 : 0;
    }

    if (days < 0) {
      const prevMonthLastDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      ).getDate();
      days += prevMonthLastDay;
      months--;
      if (months < 0) {
        months = 11;
        years--;
      }
    }

    return `${years} Years, ${months} Months, ${days} Days`;
  };

  useEffect(() => {
    const cleanAadhar = (formData.aadharNumber || "").replace(/\s/g, "");
    if (cleanAadhar.length === 12) {
      const checkAadhar = async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/registrations/check-availability?aadharNumber=${cleanAadhar}`,
          );
          const data = await res.json();
          if (!data.success) {
            showToast(data.message, "error");
            setErrors((prev) => ({ ...prev, aadharNumber: true }));
          } else {
            setErrors((prev) => {
              const { aadharNumber, ...rest } = prev;
              return rest;
            });
          }
        } catch (err) {
          console.error("Aadhar Check Error:", err);
        }
      };
      checkAadhar();
    }
  }, [formData.aadharNumber]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newValue = value;

      // Auto-format Aadhar: 0000 0000 0000
      if (name === "aadharNumber") {
        const digits = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const parts = digits.match(/.{1,4}/g);
        newValue = parts ? parts.join(" ").substring(0, 14) : digits;
      }

      const newData = { ...prev, [name]: newValue };
      if (name === "dob") {
        newData.age = calculateAge(value);
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];

      if (!file.type.startsWith("image/")) {
        showToast("Only image files are allowed", "error");
        return;
      }

      const fieldsToCrop = ["photo", "signature", "aadharFront", "aadharBack"];

      if (fieldsToCrop.includes(name)) {
        const reader = new FileReader();
        reader.onload = () => {
          setCropImage(reader.result);
          setCropField(name);
        };
        reader.readAsDataURL(file);
      } else {
        setFiles((prev) => ({ ...prev, [name]: file }));
        setImageMeta((prev) => ({
          ...prev,
          [name]: { name: file.name, type: file.type },
        }));
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviews((prev) => ({ ...prev, [name]: event.target.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCropComplete = (croppedFile) => {
    const fieldName = cropField;
    setFiles((prev) => ({ ...prev, [fieldName]: croppedFile }));
    setImageMeta((prev) => ({
      ...prev,
      [fieldName]: { name: croppedFile.name, type: croppedFile.type },
    }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews((prev) => ({ ...prev, [fieldName]: e.target.result }));
    };
    reader.readAsDataURL(croppedFile);

    setCropImage(null);
    setCropField(null);
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData((prev) => ({ ...prev, state: state, district: "" }));
  };

  const showToast = (message, type = "info") => {
    setFormData((prev) => ({ ...prev, toast: { message, type } }));
    setTimeout(() => {
      setFormData((prev) => ({ ...prev, toast: { message: "", type: "" } }));
    }, 3000);
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      setErrors((prev) => ({ ...prev, email: true }));
      return;
    }

    setFormData((prev) => ({ ...prev, loading: true }));
    try {
      // First Check if email is already registered
      const checkRes = await fetch(
        `${API_BASE_URL}/registrations/check-availability?email=${formData.email}`,
      );
      const checkData = await checkRes.json();

      if (!checkData.success) {
        throw new Error(checkData.message);
      }

      const response = await fetch(`${API_BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, otpSent: true, loading: false }));
        setResendTimer(180); // 3 minutes
        showToast("OTP code sent successfully to " + formData.email, "success");
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setFormData((prev) => ({ ...prev, loading: false }));
      showToast(err.message, "error");
    }
  };

  const handleVerifyOTP = async () => {
    const code = formData.otpValue.join("");
    if (code.length < 6) {
      showToast("Please enter 6-digit code", "warning");
      return;
    }

    setFormData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: code }),
      });
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          isEmailVerified: true,
          otpSent: false,
          loading: false,
        }));
        showToast("Email Verified Successfully!", "success");
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (err) {
      setFormData((prev) => ({ ...prev, loading: false }));
      setErrors((prev) => ({ ...prev, otpValue: true }));
      showToast(err.message, "error");
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...formData.otpValue];
    newOtp[index] = value.substring(value.length - 1);
    setFormData((prev) => ({ ...prev, otpValue: newOtp }));

    // Auto-focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !formData.otpValue[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep >= 1 && targetStep <= 4) {
      setStep(targetStep);
    }
  };

  const isFinalSubmitReady = () => {
    if (!formData.isEmailVerified) return false;

    const requiredTextFields = [
      "fullName",
      "fatherName",
      "dob",
      "gender",
      "bloodGroup",
      "kitSize",
      "email",
      "sportsDiscipline",
      "qualification",
      "fatherOccupation",
      "contactNumber",
      "parentContactNumber",
      "villageCity",
      "po",
      "ps",
      "block",
      "state",
      "district",
      "pinCode",
      "transactionId",
    ];

    const allTextFilled = requiredTextFields.every((field) =>
      Boolean(formData[field]),
    );
    const cleanAadhar = (formData.aadharNumber || "").replace(/\s/g, "");
    const isAadharValid = /^[0-9]{12}$/.test(cleanAadhar);
    const fileFields = [
      "photo",
      "signature",
      "aadharFront",
      "aadharBack",
      "paymentProof",
    ];
    const allFilesFilled = fileFields.every((field) => Boolean(files[field]));

    return allTextFilled && isAadharValid && allFilesFilled;
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    const stepFields = {
      1: [
        "fullName",
        "fatherName",
        "dob",
        "gender",
        "bloodGroup",
        "kitSize",
        "email",
        "sportsDiscipline",
        "qualification",
        "fatherOccupation",
        "contactNumber",
        "parentContactNumber",
      ],
      2: ["villageCity", "po", "ps", "block", "state", "district", "pinCode"],
      3: ["aadharNumber", "photo", "signature", "aadharFront", "aadharBack"],
      4: ["transactionId", "paymentProof"],
    };

    if ((currentStep === 1 || currentStep === 4) && !formData.isEmailVerified) {
      newErrors.email = true;
      showToast("Verification Required", "warning");
    }

    const fileFields = [
      "photo",
      "signature",
      "aadharFront",
      "aadharBack",
      "paymentProof",
    ];

    const stepsToValidate = currentStep === 4 ? [1, 2, 3, 4] : [currentStep];

    stepsToValidate.forEach((stepIndex) => {
      stepFields[stepIndex].forEach((field) => {
        if (fileFields.includes(field)) {
          if (!files[field]) newErrors[field] = true;
          return;
        }

        if (field === "aadharNumber") {
          const cleanAadhar = (formData.aadharNumber || "").replace(/\s/g, "");
          if (!/^[0-9]{12}$/.test(cleanAadhar)) {
            newErrors.aadharNumber = true;
          }
          return;
        }

        if (!formData[field]) newErrors[field] = true;
      });
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (currentStep === 4) {
        showToast(
          "Complete all required fields across every section before submitting.",
          "warning",
        );
      }

      const firstErrorField = Object.keys(newErrors)[0];
      const element =
        document.getElementsByName(firstErrorField)[0] ||
        document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    // Real-time Uniqueness Check
    setFormData((prev) => ({ ...prev, loading: true }));
    try {
      let query = "";
      if (step === 1) {
        query = `fullName=${formData.fullName}&fatherName=${formData.fatherName}&dob=${formData.dob}`;
      } else if (step === 3) {
        const cleanAadhar = (formData.aadharNumber || "").replace(/\s/g, "");
        query = `aadharNumber=${encodeURIComponent(cleanAadhar)}`;
      }

      if (query) {
        const res = await fetch(
          `${API_BASE_URL}/registrations/check-availability?${query}`,
        );
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
      }

      setStep(step + 1);
      window.scrollTo(0, 0);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFormData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setFormData((prev) => ({ ...prev, loading: true }));
    showToast("Processing registration...", "info");

    try {
      const data = new FormData();

      // Append form fields
      Object.keys(formData).forEach((key) => {
        if (
          ![
            "photo",
            "signature",
            "aadharFront",
            "aadharBack",
            "paymentProof",
            "otpValue",
            "toast",
            "loading",
          ].includes(key)
        ) {
          if (key === "aadharNumber") {
            const cleanValue = (formData.aadharNumber || "").replace(/\s/g, "");
            data.append(key, cleanValue);
          } else {
            data.append(key, formData[key]);
          }
        }
      });

      // Append files
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          data.append(key, files[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/registrations/register`, {
        method: "POST",
        body: data,
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          `Server Error: ${response.status}. ${text.substring(0, 50)}...`,
        );
      }

      if (response.ok && result.success) {
        const preservedPaymentSettings = formData.paymentSettings;
        setRegistrationResult({
          regNo: result.data.registrationNumber,
          date: new Date().toLocaleDateString(),
          ...formData,
        });
        clearDraft(); // Cleanup on success
        resetRegistrationForm(preservedPaymentSettings);
        setStep(5);
        window.scrollTo(0, 0);
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration Submission Error:", err);
      setFormData((prev) => ({ ...prev, loading: false }));
      showToast(
        err.message || "An unexpected error occurred. Please try again.",
        "error",
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (step === 5 && registrationResult) {
    return (
      <div className="registration-page receipt-view-page">
        <section className="receipt-hero-banner no-print">
          <div className="container">
            <div className="success-status">
              <div className="status-icon">✓</div>
              <div className="status-text">
                <h1>Registration Successful</h1>
                <p>Application under verification. We will contact within 2-3 working days.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="receipt-document-wrapper">
          <div className="receipt-professional-document short-receipt" id="printable-receipt">
            <div className="document-header">
              <div className="org-branding">
                <img src="/logo.jpeg" alt="ITF Logo" className="doc-logo" />
                <div className="org-names">
                  <h1>ITF OF INDIA</h1>
                  <p>National Sports Federation & Athlete Portal</p>
                </div>
              </div>
              <div className="doc-meta">
                <div className="reg-badge">OFFICIAL RECEIPT</div>
                <div className="meta-item">
                  <label>Receipt ID</label>
                  <strong>{registrationResult.regNo}</strong>
                </div>
                <div className="meta-item">
                  <label>Date Issued</label>
                  <strong>{registrationResult.date}</strong>
                </div>
              </div>
            </div>

            <div className="document-body">
              <div className="doc-section">
                <h3 className="section-divider">Athlete Details</h3>
                <div className="info-grid">
                  <div className="info-cell">
                    <label>Full Name</label>
                    <span>{registrationResult.fullName}</span>
                  </div>
                  <div className="info-cell">
                    <label>Sport Discipline</label>
                    <span>{registrationResult.sportsDiscipline}</span>
                  </div>
                </div>
              </div>

              <div className="doc-section">
                <h3 className="section-divider">Verification Status</h3>
                <div className="payment-status-box">
                  <div className="payment-detail">
                    <label>Transaction ID / UTR</label>
                    <strong>{registrationResult.transactionId}</strong>
                  </div>
                  <div className="payment-detail">
                    <label>Status</label>
                    <span className="status-pending-pill">Under Verification</span>
                  </div>
                </div>
              </div>

              <div className="verification-notice-box">
                <p>Application is currently under official review. Our verification team will contact you on your registered mobile/email within <strong>2-3 working days</strong> for the final approval.</p>
              </div>
            </div>

            <div className="document-footer">
              <div className="signature-area">
                <div className="sig-box center-sig">
                  <img
                    src="/logo.jpeg"
                    alt="Official Seal"
                    className="watermark-stamp official-seal"
                  />
                  <div className="sig-line"></div>
                  <p>Registrar, ITF OF INDIA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="receipt-footer-actions no-print">
            <button className="btn-outline" onClick={handlePrint}>
              Print Official Receipt
            </button>
            <button
              className="btn-premium"
              onClick={() => {
                clearDraft();
                window.location.reload();
              }}
            >
              Finish & Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="registration-page">
      {/* Image Cropper Modal */}
      {cropImage && (
        <ImageCropper
          image={cropImage}
          cropShape={cropField === "photo" ? "round" : "rect"}
          aspect={
            cropField === "photo" ? 1 : cropField === "signature" ? 3 : 1.58 // Standard ID card aspect ratio for Aadhar
          }
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImage(null);
            setCropField(null);
          }}
        />
      )}

      <section className="registration-hero page-hero">
        {/* Continuous Background Banner */}
        <div className="hero-bg-banner no-print">
          <div className="banner-track">
            {/* Horizontal oriented images from the collection */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div className="bg-image-box" key={num}>
                <img
                  src={`/club_image/img${num}.jpeg`}
                  alt="ITF India Athlete"
                />
              </div>
            ))}
            {/* Repeat for seamless loop */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div className="bg-image-box" key={`dup-${num}`}>
                <img
                  src={`/club_image/img${num}.jpeg`}
                  alt="ITF India Athlete"
                />
              </div>
            ))}
          </div>
          <div className="hero-overlay"></div>
        </div>

        <div className="container hero-content">
          <span className="section-tag">National Sports Portal</span>
          <h1>Athlete Registration</h1>
          <p className="hero-desc">
            Secure your professional athletic identity. Join the ITF OF INDIA to
            access national championships, training camps, and global
            opportunities.
          </p>
          <div className="fee-callout">
            <span className="fee-icon">🎟️</span>
            Registration Fee: ₹{formData.paymentSettings?.amount || "500"}/-
            Only
          </div>
        </div>
      </section>

      <section className="registration-content section">
        <div className="container">
          <div className="registration-layout">
            <div className="registration-main">
              {formData.toast.message && (
                <div
                  className={`premium-toast-bar ${formData.toast.type} fade-in`}
                >
                  <div className="toast-logo">
                    <img src="/logo.jpeg" alt="ITF Logo" />
                  </div>
                  <div className="toast-content">
                    <h5>ITF India Portal</h5>
                    <p>{formData.toast.message}</p>
                  </div>
                  <div className="toast-progress-bar"></div>
                </div>
              )}
              <div className="form-steps no-print">
                <div
                  className={`step-item ${step === 1 ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(1)}
                  onKeyDown={(e) => e.key === "Enter" && handleStepClick(1)}
                >
                  <span className="step-num">01</span>
                  <span className="step-label">Personal</span>
                </div>
                <div
                  className={`step-item ${step === 2 ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(2)}
                  onKeyDown={(e) => e.key === "Enter" && handleStepClick(2)}
                >
                  <span className="step-num">02</span>
                  <span className="step-label">Residency</span>
                </div>
                <div
                  className={`step-item ${step === 3 ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(3)}
                  onKeyDown={(e) => e.key === "Enter" && handleStepClick(3)}
                >
                  <span className="step-num">03</span>
                  <span className="step-label">Identity</span>
                </div>
                <div
                  className={`step-item ${step === 4 ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(4)}
                  onKeyDown={(e) => e.key === "Enter" && handleStepClick(4)}
                >
                  <span className="step-num">04</span>
                  <span className="step-label">Payment</span>
                </div>
              </div>

              <form
                className="advanced-form registration-form-container fade-in"
                onSubmit={handleSubmit}
              >
                {step === 1 && (
                  <div className="form-section">
                    <h3>Personal Identity</h3>
                    <div className="input-group">
                      <div
                        className={`input-field ${errors.fullName ? "field-error" : ""}`}
                      >
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Full Name as per Aadhar"
                        />
                        {errors.fullName && (
                          <span className="error-msg">
                            Full Name is required
                          </span>
                        )}
                      </div>
                      <div
                        className={`input-field ${errors.fatherName ? "field-error" : ""}`}
                      >
                        <label>Father's Name</label>
                        <input
                          type="text"
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleInputChange}
                          placeholder="Father's Name"
                        />
                        {errors.fatherName && (
                          <span className="error-msg">
                            Father's Name is required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.dob ? "field-error" : ""}`}
                      >
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                        />
                        {errors.dob && (
                          <span className="error-msg">
                            Date of Birth is required
                          </span>
                        )}
                      </div>
                      <div className="input-field">
                        <label>Calculated Age</label>
                        <input
                          type="text"
                          name="age"
                          value={formData.age}
                          readOnly
                          placeholder="Years, Months, Days"
                          className="readonly-input"
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.gender ? "field-error" : ""}`}
                      >
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <span className="error-msg">Gender is required</span>
                        )}
                      </div>
                      <div
                        className={`input-field ${errors.bloodGroup ? "field-error" : ""}`}
                      >
                        <label>Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                        >
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
                        {errors.bloodGroup && (
                          <span className="error-msg">
                            Blood Group is required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.kitSize ? "field-error" : ""}`}
                      >
                        <label>Official Kit Size</label>
                        <select
                          name="kitSize"
                          value={formData.kitSize}
                          onChange={handleInputChange}
                        >
                          <option value="">Choose Uniform Size</option>
                          <option value="XS">XS (Extra Small)</option>
                          <option value="S">S (Small)</option>
                          <option value="M">M (Medium)</option>
                          <option value="L">L (Large)</option>
                          <option value="XL">XL (Extra Large)</option>
                          <option value="XXL">XXL (Double Extra Large)</option>
                          <option value="3XL">3XL (Triple Extra Large)</option>
                        </select>
                        {errors.kitSize && (
                          <span className="error-msg">
                            Kit Size is required
                          </span>
                        )}
                      </div>
                      <div className="input-field">
                        {/* Empty field for spacing or another field */}
                      </div>
                    </div>

                    <div
                      className={`input-field full ${errors.email ? "field-error" : ""}`}
                    >
                      <label>Email Address</label>
                      <div className="verify-input-wrapper">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="example@email.com"
                          disabled={formData.isEmailVerified}
                        />
                        {!formData.isEmailVerified && !formData.otpSent && (
                          <button
                            type="button"
                            className="verify-btn"
                            onClick={handleSendOTP}
                            disabled={formData.loading}
                          >
                            {formData.loading ? "Sending..." : "Send OTP"}
                          </button>
                        )}
                        {formData.isEmailVerified && (
                          <span className="verified-badge">✓ Verified</span>
                        )}
                      </div>
                      {errors.email && !formData.isEmailVerified && (
                        <span className="error-msg">
                          Email verification required
                        </span>
                      )}
                    </div>

                    {formData.otpSent && !formData.isEmailVerified && (
                      <div className="otp-verification-box glass-premium fade-in">
                        <div className="otp-header">
                          <div className="otp-title-group">
                            <h4>Email Verification</h4>
                            <p>Enter the 6-digit code to proceed</p>
                          </div>
                          <span
                            className={`resend-link ${formData.loading || resendTimer > 0 ? "disabled" : ""}`}
                            onClick={
                              !formData.loading && resendTimer === 0
                                ? handleSendOTP
                                : null
                            }
                          >
                            {formData.loading
                              ? "Processing..."
                              : resendTimer > 0
                                ? `Resend in ${formatTime(resendTimer)}`
                                : "Resend OTP"}
                          </span>
                        </div>

                        <div className="otp-digit-container">
                          {formData.otpValue.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`otp-${idx}`}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength="1"
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(idx, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="otp-digit-box"
                              placeholder="•"
                            />
                          ))}
                        </div>

                        <div className="otp-actions">
                          <button
                            type="button"
                            className="btn-premium w-full"
                            onClick={handleVerifyOTP}
                            disabled={formData.loading}
                          >
                            {formData.loading
                              ? "Verifying..."
                              : "Verify & Authenticate Code"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.sportsDiscipline ? "field-error" : ""}`}
                      >
                        <label>Sports Discipline</label>
                        <select
                          name="sportsDiscipline"
                          value={formData.sportsDiscipline}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Discipline</option>
                          {sportsDisciplines.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {errors.sportsDiscipline && (
                          <span className="error-msg">
                            Discipline is required
                          </span>
                        )}
                      </div>
                      <div
                        className={`input-field ${errors.qualification ? "field-error" : ""}`}
                      >
                        <label>Educational Qualification</label>
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          placeholder="e.g. 10th, Graduate"
                        />
                        {errors.qualification && (
                          <span className="error-msg">
                            Qualification is required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.fatherOccupation ? "field-error" : ""}`}
                      >
                        <label>Father's Occupation</label>
                        <input
                          type="text"
                          name="fatherOccupation"
                          value={formData.fatherOccupation}
                          onChange={handleInputChange}
                          placeholder="Father's Occupation"
                        />
                        {errors.fatherOccupation && (
                          <span className="error-msg">
                            Occupation is required
                          </span>
                        )}
                      </div>
                      <div
                        className={`input-field ${errors.contactNumber ? "field-error" : ""}`}
                      >
                        <label>Athlete Contact Number</label>
                        <div className="phone-input-group">
                          <span className="phone-prefix">+91</span>
                          <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            placeholder="10 Digit Number"
                            maxLength="10"
                            inputMode="tel"
                            pattern="[0-9]*"
                          />
                        </div>
                        {errors.contactNumber && (
                          <span className="error-msg">
                            Contact number is required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.parentContactNumber ? "field-error" : ""}`}
                      >
                        <label>Parent / Guardian Contact</label>
                        <div className="phone-input-group">
                          <span className="phone-prefix">+91</span>
                          <input
                            type="tel"
                            name="parentContactNumber"
                            value={formData.parentContactNumber}
                            onChange={handleInputChange}
                            placeholder="Emergency Contact Number"
                            maxLength="10"
                            inputMode="tel"
                            pattern="[0-9]*"
                          />
                        </div>
                        {errors.parentContactNumber && (
                          <span className="error-msg">
                            Parent's contact is required
                          </span>
                        )}
                      </div>
                      <div className="input-field">{/* Spacing */}</div>
                    </div>

                    <div className="form-footer-actions">
                      <button
                        type="button"
                        className="btn-premium"
                        onClick={handleNext}
                      >
                        Next Step: Address Details →
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="form-section">
                    <h3>Residency Details</h3>
                    <div className="input-group">
                      <div
                        className={`input-field ${errors.villageCity ? "field-error" : ""}`}
                      >
                        <label>Village / City</label>
                        <input
                          type="text"
                          name="villageCity"
                          value={formData.villageCity}
                          onChange={handleInputChange}
                          placeholder="Village or City"
                        />
                        {errors.villageCity && (
                          <span className="error-msg">
                            Village/City is required
                          </span>
                        )}
                      </div>
                      <div
                        className={`input-field ${errors.po ? "field-error" : ""}`}
                      >
                        <label>Post Office (P.O.)</label>
                        <input
                          type="text"
                          name="po"
                          value={formData.po}
                          onChange={handleInputChange}
                          placeholder="P.O."
                        />
                        {errors.po && (
                          <span className="error-msg">
                            Post Office is required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.ps ? "field-error" : ""}`}
                      >
                        <label>Police Station (P.S.)</label>
                        <input
                          type="text"
                          name="ps"
                          value={formData.ps}
                          onChange={handleInputChange}
                          placeholder="P.S."
                        />
                        {errors.ps && (
                          <span className="error-msg">
                            Police Station is required
                          </span>
                        )}
                      </div>
                      <div
                        className={`input-field ${errors.block ? "field-error" : ""}`}
                      >
                        <label>Block</label>
                        <input
                          type="text"
                          name="block"
                          value={formData.block}
                          onChange={handleInputChange}
                          placeholder="Block Name"
                        />
                        {errors.block && (
                          <span className="error-msg">Block is required</span>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div
                        className={`input-field ${errors.state ? "field-error" : ""}`}
                      >
                        <label>State</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleStateChange}
                        >
                          <option value="">Select State</option>
                          {Object.keys(stateDistrictMap).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {errors.state && (
                          <span className="error-msg">State is required</span>
                        )}
                      </div>
                      <div
                        className={`input-field ${errors.district ? "field-error" : ""}`}
                      >
                        <label>District</label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          disabled={!formData.state}
                        >
                          <option value="">Select District</option>
                          {formData.state &&
                            stateDistrictMap[formData.state].map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                        </select>
                        {errors.district && (
                          <span className="error-msg">
                            District is required
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`input-field full ${errors.pinCode ? "field-error" : ""}`}
                    >
                      <label>Pin Code</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        placeholder="6 Digit Pin Code"
                        maxLength="6"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {errors.pinCode && (
                        <span className="error-msg">Pin Code is required</span>
                      )}
                    </div>

                    <div className="form-buttons">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setStep(1)}
                      >
                        ← Previous
                      </button>
                      <button
                        type="button"
                        className="btn-premium"
                        onClick={handleNext}
                      >
                        Next Step: Identity Documents →
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="form-section">
                    <h3>Identity & Documents</h3>
                    <div
                      className={`input-field full ${errors.aadharNumber ? "field-error" : ""}`}
                      style={{ marginBottom: "2.5rem" }}
                    >
                      <label>Aadhaar Card Number (12 Digits)</label>
                      <input
                        type="text"
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9123"
                        maxLength="14"
                        inputMode="numeric"
                        pattern="[0-9 ]*"
                        autoComplete="off"
                      />
                      <div className="input-note">
                        Enter exactly 12 digits. Spaces are added automatically
                        for readability.
                      </div>
                      {errors.aadharNumber && (
                        <span className="error-msg">
                          Aadhaar number must contain 12 digits
                        </span>
                      )}
                    </div>

                    <div className="upload-grid">
                      <div
                        id="photo"
                        className={`upload-card ${previews.photo ? "has-file" : ""} ${errors.photo ? "card-error" : ""}`}
                      >
                        <div className="card-icon">📷</div>
                        <div className="card-info">
                          <h4>Passport Photo</h4>
                          <p>Formal background, Max 2MB</p>
                          {errors.photo && (
                            <span className="error-msg">Photo is required</span>
                          )}
                        </div>
                        <div className="upload-action-area">
                          {previews.photo ? (
                            <div className="preview-container">
                              <img src={previews.photo} alt="Passport" />
                              <button
                                type="button"
                                className="change-file-btn"
                                onClick={() =>
                                  document
                                    .getElementById("photo-upload")
                                    .click()
                                }
                              >
                                <span>Change Photo</span>
                              </button>
                            </div>
                          ) : (
                            <div className="upload-btn-wrapper">
                              <label
                                htmlFor="photo-upload"
                                className="btn-premium btn-small"
                              >
                                <span>Upload Photo</span>
                              </label>
                              <input
                                type="file"
                                id="photo-upload"
                                name="photo"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        id="signature"
                        className={`upload-card ${previews.signature ? "has-file" : ""} ${errors.signature ? "card-error" : ""}`}
                      >
                        <div className="card-icon">✍️</div>
                        <div className="card-info">
                          <h4>Athlete Signature</h4>
                          <p>Scanned copy on white paper</p>
                          {errors.signature && (
                            <span className="error-msg">
                              Signature is required
                            </span>
                          )}
                        </div>
                        <div className="upload-action-area">
                          {previews.signature ? (
                            <div className="preview-container">
                              <img src={previews.signature} alt="Signature" />
                              <button
                                type="button"
                                className="change-file-btn"
                                onClick={() =>
                                  document.getElementById("sig-upload").click()
                                }
                              >
                                <span>Change Signature</span>
                              </button>
                            </div>
                          ) : (
                            <div className="upload-btn-wrapper">
                              <label
                                htmlFor="sig-upload"
                                className="btn-premium btn-small"
                              >
                                <span>Upload Signature</span>
                              </label>
                              <input
                                type="file"
                                id="sig-upload"
                                name="signature"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        id="aadharFront"
                        className={`upload-card ${previews.aadharFront ? "has-file" : ""} ${errors.aadharFront ? "card-error" : ""}`}
                      >
                        <div className="card-icon">🆔</div>
                        <div className="card-info">
                          <h4>Aadhar Front</h4>
                          <p>Front side of Aadhar Card</p>
                          {errors.aadharFront && (
                            <span className="error-msg">
                              Front side is required
                            </span>
                          )}
                        </div>
                        <div className="upload-action-area">
                          {previews.aadharFront ? (
                            <div className="preview-container">
                              <img
                                src={previews.aadharFront}
                                alt="Aadhar Front"
                              />
                              <button
                                type="button"
                                className="change-file-btn"
                                onClick={() =>
                                  document
                                    .getElementById("aadhar-front-upload")
                                    .click()
                                }
                              >
                                <span>Change Front</span>
                              </button>
                            </div>
                          ) : (
                            <div className="upload-btn-wrapper">
                              <label
                                htmlFor="aadhar-front-upload"
                                className="btn-premium btn-small"
                              >
                                <span>Upload Front</span>
                              </label>
                              <input
                                type="file"
                                id="aadhar-front-upload"
                                name="aadharFront"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        id="aadharBack"
                        className={`upload-card ${previews.aadharBack ? "has-file" : ""} ${errors.aadharBack ? "card-error" : ""}`}
                      >
                        <div className="card-icon">🆔</div>
                        <div className="card-info">
                          <h4>Aadhar Back</h4>
                          <p>Back side of Aadhar Card</p>
                          {errors.aadharBack && (
                            <span className="error-msg">
                              Back side is required
                            </span>
                          )}
                        </div>
                        <div className="upload-action-area">
                          {previews.aadharBack ? (
                            <div className="preview-container">
                              <img
                                src={previews.aadharBack}
                                alt="Aadhar Back"
                              />
                              <button
                                type="button"
                                className="change-file-btn"
                                onClick={() =>
                                  document
                                    .getElementById("aadhar-back-upload")
                                    .click()
                                }
                              >
                                <span>Change Back</span>
                              </button>
                            </div>
                          ) : (
                            <div className="upload-btn-wrapper">
                              <label
                                htmlFor="aadhar-back-upload"
                                className="btn-premium btn-small"
                              >
                                <span>Upload Back</span>
                              </label>
                              <input
                                type="file"
                                id="aadhar-back-upload"
                                name="aadharBack"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-buttons">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setStep(2)}
                      >
                        ← Previous
                      </button>
                      <button
                        type="button"
                        className="btn-premium"
                        onClick={handleNext}
                      >
                        Proceed to Payment →
                      </button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="form-section">
                    <h3>Secure Payment</h3>
                    <div className="payment-summary-box glass">
                      <div className="summary-item">
                        <label>Athlete Name</label>
                        <p>{formData.fullName || "—"}</p>
                      </div>
                      <div className="summary-item">
                        <label>Father's Name</label>
                        <p>{formData.fatherName || "—"}</p>
                      </div>
                      <div className="summary-item">
                        <label>Date of Birth</label>
                        <p>{formData.dob || "—"}</p>
                      </div>
                      <div className="summary-amount">
                        <label>Registration Fee</label>
                        <div className="price">
                          ₹{formData.paymentSettings?.amount || "500"}.00
                        </div>
                      </div>
                    </div>

                    <div className="payment-grid">
                      <div className="qr-container-card glass">
                        <div className="qr-header">
                          <h4>Scan to Pay</h4>
                          <p>Use any UPI App (GPay, PhonePe, Paytm)</p>
                        </div>
                        <div className="qr-image-wrapper">
                          {formData.paymentSettings?.upiId ? (
                            <QRCodeSVG
                              value={`upi://pay?pa=${formData.paymentSettings.upiId}&pn=${encodeURIComponent(formData.paymentSettings.merchantName)}&am=${formData.paymentSettings.amount}&cu=INR`}
                              size={180}
                              level="H"
                              includeMargin={true}
                            />
                          ) : (
                            <div className="qr-placeholder">
                              <p>Loading Gateway...</p>
                            </div>
                          )}
                        </div>
                        <div className="qr-footer">
                          <span>ITF OF INDIA NATIONAL TRUST</span>
                        </div>
                      </div>

                      <div
                        className={`payment-form-side ${errors.transactionId ? "field-error" : ""}`}
                      >
                        <div className="input-field full">
                          <label>Transaction ID / UTR Number</label>
                          <input
                            type="text"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleInputChange}
                            placeholder="12 Digit UTR or Transaction ID"
                            inputMode="numeric"
                            pattern="[0-9]*"
                          />
                          {errors.transactionId && (
                            <span className="error-msg">
                              Transaction ID is required
                            </span>
                          )}
                        </div>

                        <div
                          id="paymentProof"
                          className={`upload-card small-card ${previews.paymentProof ? "has-file" : ""} ${errors.paymentProof ? "card-error" : ""}`}
                        >
                          <div className="card-info">
                            <h4>Payment Proof</h4>
                            <p>Screenshot of success screen</p>
                            {errors.paymentProof && (
                              <span className="error-msg">
                                Payment proof is required
                              </span>
                            )}
                          </div>
                          <div className="upload-action-area">
                            {previews.paymentProof ? (
                              <div className="preview-container mini">
                                <img src={previews.paymentProof} alt="Proof" />
                                <button
                                  type="button"
                                  className="change-file-btn"
                                  onClick={() =>
                                    document
                                      .getElementById("proof-upload")
                                      .click()
                                  }
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <div className="upload-btn-wrapper">
                                <label
                                  htmlFor="proof-upload"
                                  className="btn-premium btn-small"
                                >
                                  <span>Upload Proof</span>
                                </label>
                                <input
                                  type="file"
                                  id="proof-upload"
                                  name="paymentProof"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  required
                                  style={{ display: "none" }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-buttons">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setStep(3)}
                        disabled={formData.loading}
                      >
                        ← Previous
                      </button>
                      <button
                        type="submit"
                        className="btn-premium"
                        disabled={formData.loading || !isFinalSubmitReady()}
                      >
                        {formData.loading
                          ? "Verifying & Saving..."
                          : "Complete Registration & Verify →"}
                      </button>
                    </div>
                    {!isFinalSubmitReady() && (
                      <div className="submit-note">
                        Complete all required fields on every page before final
                        submission.
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="registration-sidebar no-print">
              <div className="info-card glass">
                <h4>Steps to Register</h4>
                <div className="steps-list">
                  <div className={`step-guide ${step >= 1 ? "done" : ""}`}>
                    <span className="dot"></span>
                    <p>01. Personal Identity</p>
                  </div>
                  <div className={`step-guide ${step >= 2 ? "done" : ""}`}>
                    <span className="dot"></span>
                    <p>02. Residency Details</p>
                  </div>
                  <div className={`step-guide ${step >= 3 ? "done" : ""}`}>
                    <span className="dot"></span>
                    <p>03. Identity Documents</p>
                  </div>
                  <div className={`step-guide ${step >= 4 ? "done" : ""}`}>
                    <span className="dot"></span>
                    <p>04. Payment Verification</p>
                  </div>
                  <div className={`step-guide ${step >= 5 ? "done" : ""}`}>
                    <span className="dot"></span>
                    <p>05. Official Receipt</p>
                  </div>
                </div>
              </div>

              <div className="info-card glass danger-card">
                <h4>Payment Notice</h4>
                <p className="warning-text">
                  Registration fees are <strong>Non-Refundable</strong> under
                  any circumstances. Please verify all details before payment.
                </p>
              </div>

              <div className="info-card glass">
                <h4>Required Documents</h4>
                <ul className="doc-list">
                  <li>Valid Aadhar Card (Front & Back)</li>
                  <li>Recent Passport Photo</li>
                  <li>Educational Credentials</li>
                  <li>Signature on White Paper</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;
