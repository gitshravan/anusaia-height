/* ============================================================
   ANUSAIA HEIGHT website: everything you may want to change is here.
   Fill in the empty "" fields; the site shows them everywhere at once
   (header, contact section, floating buttons, enquiry form).
   ============================================================ */
window.SITE = {
  name: "Anusaia Height",
  developer: "Drream Vastu Developers",
  tagline: "Karanjade · Panvel",
  address: "Plot No. 102, Sector R5, Node Pushpak, Vadghar, Karanjade, Panvel",

  /* CONTACT: leave empty until ready. Phone with country code, e.g. "+91 98765 43210" */
  phone: "+91 97695 08130",
  whatsapp: "919769508130",          // number only, with country code, e.g. "919876543210"
  email: "",
  officeAddress: "",
  officeHours: "",
  reraNumber: "",        // MahaRERA registration number

  /* Where enquiry forms go. Paste a Formspree / Getform / Google Apps Script URL here to receive
     leads by email. Empty: the form opens WhatsApp (if set), else the email app (if set). */
  formEndpoint: "",

  priceFrom: "₹42 Lakhs",          // shown as "Starting ₹42 Lakhs, all inclusive". "" hides it
  priceNote: "all inclusive",

  /* Map pin (Plot 102, Sector R5) */
  lat: 18.989064,
  lon: 73.095658,

  /* Drive times from the site (road routing), minutes */
  nearby: [
    ["Panvel Old Market", 5],
    ["Panvel Station", 6],
    ["Kalamboli Junction", 6],
    ["Khandeshwar Station", 7],
    ["Navi Mumbai International Airport", 10]
  ],

  /* Residence types and their 360° rooms (assets/rooms/<id>.jpg) */
  types: {
    A: { name: "Type A", config: "1 BHK", rooms: [["a-living", "Living & dining"], ["a-kitchen", "Kitchen"], ["a-bedroom", "Bedroom"], ["a-bath", "Bathroom"], ["a-balcony", "Balcony"]] },
    B: { name: "Type B", config: "1 BHK", rooms: [["b-living", "Living room"], ["b-kitchen", "Kitchen"], ["b-bedroom", "Bedroom"], ["b-bath", "Bathroom"]] },
    C: { name: "Type C", config: "1 RK",  rooms: [["c-living", "Living room"], ["c-kitchen", "Kitchen"], ["c-balcony", "Balcony"], ["c-bath", "Bathroom"]] }
  },

  /* Which types are on which floor (1 = first floor above the stilt). Please confirm with the developer. */
  floors: {
    1: ["A", "B"], 2: ["A", "B"], 3: ["A", "B"], 4: ["A", "B"], 5: ["A", "B"], 6: ["A", "B"], 7: ["C", "A"]
  }
};
