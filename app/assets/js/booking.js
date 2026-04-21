const API_BASE =
  window.__API_BASE__ ||
  (window.location.origin.includes("localhost:") || window.location.origin.includes("127.0.0.1:")
    ? "http://localhost:5000"
    : window.location.origin.includes("pangia.world")
      ? "https://api.pangia.world"
      : window.location.origin);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");
  if (form) {
    form.addEventListener("submit", handleBookingSubmit);
  }
});

function getFormValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function getUtmData() {
  return {
    utm_source: localStorage.getItem("utm_source"),
    utm_medium: localStorage.getItem("utm_medium"),
    utm_campaign: localStorage.getItem("utm_campaign"),
    referrer: document.referrer || document.location.href
  };
}

function buildBookingPayload() {
  const location = getFormValue("location");
  return {
    fullName: getFormValue("full-name"),
    email: getFormValue("email"),
    phone: getFormValue("phone"),
    address: {
      street: location,
      city: "",
      state: "",
      postalCode: ""
    },
    serviceArea: location,
    waterSource: getFormValue("water-source"),
    propertyType: getFormValue("property-type"),
    concerns: getFormValue("concerns"),
    preferredDate: "",
    preferredTime: "",
    contactMethod: "",
    notes: "",
    honeypot: getFormValue("contact-code"),
    originType: "booking",
    ...getUtmData()
  };
}

function showBookingAlert(message, type = "info") {
  const alertBox = document.getElementById("booking-alert");
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `booking-alert show ${type}`;
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  const submitBtn = document.getElementById("booking-submit");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }
  if (getFormValue("contact-code")) {
    showBookingAlert("Unable to submit at this time.", "error");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Inquiry";
    }
    return;
  }
  showBookingAlert("Sending your inquiry...", "info");

  try {
    const payload = buildBookingPayload();
    const bookingResponse = await fetch(`${API_BASE}/api/bookings/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const bookingData = await bookingResponse.json();
    if (!bookingResponse.ok) {
      throw new Error(bookingData.message || "Unable to create booking.");
    }

    const bookingId =
      bookingData.bookingId ||
      bookingData?.booking?._id ||
      bookingData?.id;

    if (!bookingId) {
      throw new Error("Booking created but no ID returned.");
    }
    form.reset();
    showBookingAlert("Thanks. We will review your inquiry and respond within one business day.", "info");
  } catch (error) {
    console.error("Booking error", error);
    showBookingAlert(error.message || "An error occurred. Please try again.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Inquiry";
    }
  }
}
