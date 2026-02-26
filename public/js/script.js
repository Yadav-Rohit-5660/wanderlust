(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

document.addEventListener("DOMContentLoaded", () => {
  const getOtpBtn = document.getElementById("getOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const signupBtn = document.getElementById("signupBtn");

  // Helper: show alerts consistently
  function showAlert(message, type = "info") {
    // You can replace alert() with SweetAlert or a custom UI later
    alert(message);
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // Handle Get OTP
  if (getOtpBtn) {
    getOtpBtn.onclick = async () => {
      const emailInput = document.querySelector("#signupForm input[name='email']");
      const email = emailInput ? emailInput.value.trim() : "";

      console.log("Email entered:", email);

      if (!email) {
        showAlert("Please enter your email before requesting OTP", "error");
        return;
      }

      try {
        const res = await fetch("/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        showAlert(data.message || data.error, data.success ? "success" : "error");
      } catch (err) {
        console.error("Error sending OTP:", err);
        showAlert("Something went wrong while sending OTP", "error");
      }
    };
  }

  // Handle Verify OTP
  if (verifyOtpBtn) {
    verifyOtpBtn.onclick = async () => {
      const emailInput = document.querySelector("#signupForm input[name='email']");
      const otpInput = document.querySelector("#signupForm input[name='otp']");
      const email = emailInput ? emailInput.value.trim() : "";
      const otp = otpInput ? otpInput.value.trim() : "";

      console.log("Verifying OTP:", otp, "for email:", email);

      if (!email || !otp) {
        showAlert("Please enter both email and OTP", "error");
        return;
      }

      try {
        const res = await fetch("/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp })
        });

        const data = await res.json();
        showAlert(data.message || data.error, data.success ? "success" : "error");

        if (data.success && signupBtn) {
          signupBtn.style.display = "inline-block"; // show signup button
        }
      } catch (err) {
        console.error("Error verifying OTP:", err);
        showAlert("Something went wrong while verifying OTP", "error");
      }
    };
  }
});

// Login and SignUp

document.addEventListener("DOMContentLoaded", () => {
  const loginToggle = document.getElementById("loginToggle");
  const signupToggle = document.getElementById("signupToggle");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const switchToSignup = document.getElementById("switchToSignup");
  const switchToLogin = document.getElementById("switchToLogin");

  function showLogin() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginToggle.classList.add("active");
    signupToggle.classList.remove("active");
  }

  function showSignup() {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupToggle.classList.add("active");
    loginToggle.classList.remove("active");
  }

  if (loginToggle) loginToggle.addEventListener("click", showLogin);
  if (signupToggle) signupToggle.addEventListener("click", showSignup);
  if (switchToSignup) switchToSignup.addEventListener("click", showSignup);
  if (switchToLogin) switchToLogin.addEventListener("click", showLogin);

  // Navbar
  // Handle query parameter from navbar links
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab === "signup") {
    showSignup();
  } else if (tab === "login") {
    showLogin();
  }
});

// // Edit/Delete Owner Action
// document.addEventListener("DOMContentLoaded", () => {
//   // const ownerActions = document.querySelectorAll(".owner-action");

//   // ownerActions.forEach(action => {
//   //   action.addEventListener("click", function (e) {
//   //     if (!isOwner) {
//   //       e.preventDefault(); // stop navigation or form submission
//   //       Swal.fire({
//   //         title: "Access Denied",
//   //         text: "You must login as an owner to edit or delete listings.",
//   //         icon: "error",
//   //         confirmButtonText: "OK"
//   //       });
//   //     }
//   //   });
//   // });

//   // Special handling for delete forms
//   const deleteForms = document.querySelectorAll(".delete-form");
//   deleteForms.forEach(form => {
//     form.addEventListener("submit", function (e) {
//       if (!isOwner) {
//         e.preventDefault();
//         Swal.fire({
//           title: "Access Denied",
//           text: "You must login as an owner to delete listings.",
//           icon: "error",
//           confirmButtonText: "OK"
//         });
//       } else {
//         e.preventDefault();
//         Swal.fire({
//           title: "Are you sure?",
//           text: "This action cannot be undone!",
//           icon: "warning",
//           showCancelButton: true,
//           confirmButtonColor: "#d33",
//           cancelButtonColor: "#3085d6",
//           confirmButtonText: "Yes, delete it!"
//         }).then(result => {
//           if (result.isConfirmed) {
//             form.submit();
//           }
//         });
//       }
//     });
//   });
// });

// Booking Confirmation
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  const btn = document.getElementById("bookButton");

  if (form && btn) {
    btn.addEventListener("click", (event) => {
      event.preventDefault(); // stop auto-submit

      Swal.fire({
        title: "Confirm Booking?",
        text: "Do you want to book this place?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, book it!",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit(); // manually submit after confirmation
        }
      });
    });
  } else {
    console.warn("Booking form or button not found in DOM");
  }
});


// Edit/Delete Confirmation
document.addEventListener("DOMContentLoaded", () => {
  const editLinks = document.querySelectorAll("a.edit-btn");   // use editLinks consistently
  const deleteForms = document.querySelectorAll(".delete-form");
   const editForms = document.querySelectorAll("form[action*='_method=PUT']"); // edit page forms

  // Handle Edit
  editLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      Swal.fire({
        title: "Confirm Edit",
        text: "Do you want to edit this listing?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, edit it!"
      }).then(result => {
        if (result.isConfirmed) {
          window.location.href = link.getAttribute("href"); // proceed to edit page
        }
      });
    });
  });

  // Handle Delete
  deleteForms.forEach(form => {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // stop immediate submission

      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit(); // proceed with deletion
        }
      });
    });
  });

  // Handle Edit Form (edit page)
  editForms.forEach(form => {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // stop immediate submission

      Swal.fire({
        title: "Confirm Save",
        text: "Do you want to save changes to this listing?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Yes, save it!"
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit(); // proceed with update
        }
      });
    });
  });
});