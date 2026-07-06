/* ---------- Supabase connection ---------- */
const SUPABASE_URL = "https://kpzpwjslhlkhqsllaals.supabase.co";
const SUPABASE_KEY = "sb_publishable_9Pid0rmZu6k2WaMxdlfRCA_fYzo8vFr";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- EmailJS connection ---------- */
const EMAILJS_PUBLIC_KEY = "KI23G-OpBOsDeLTMF";
const EMAILJS_SERVICE_ID = "service_2v3ubcc";
const EMAILJS_TEMPLATE_ID = "template_9fkhsb3";

emailjs.init(EMAILJS_PUBLIC_KEY);

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.adm-form');
  const successBox = document.getElementById('adm-success');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('.adm-btn');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Submitting...';

    const payload = {
      parent_name: document.getElementById('adm-parent').value.trim(),
      email: document.getElementById('adm-email').value.trim(),
      phone: document.getElementById('adm-phone').value.trim(),
      child_name: document.getElementById('adm-child').value.trim(),
      date_of_birth: document.getElementById('adm-dob').value,
      school_level: document.getElementById('adm-level').value,
      intake_year: document.getElementById('adm-year').value,
      boarding_option: document.getElementById('adm-boarding').value,
      message: document.getElementById('adm-msg').value.trim() || null,
      source: document.getElementById('adm-source').value || null
    };

    const { error } = await supabaseClient.from('admissions').insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
      alert('Sorry, something went wrong submitting your application. Please try again or contact us directly.');
      return;
    }

    /* Send email notification (does not block success if this fails) */
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
    } catch (emailErr) {
      console.error('EmailJS send error:', emailErr);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHTML;

    /* Success: hide form, show success message */
    form.style.display = 'none';
    if (successBox) successBox.classList.remove('adm-success-hidden');
    form.reset();
  });
});
