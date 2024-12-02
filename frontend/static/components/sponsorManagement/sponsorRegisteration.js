export default {
  template: `
    <div class="container-fluid mt-5 d-flex flex-column align-items-center">
      <div class="col-12 col-md-6">
        <h1 class="text-center mb-4">Sponsor Registration</h1>
        <p v-if="message" :class="{'text-success': isSuccess, 'text-danger': !isSuccess}">{{ message }}</p>
        <form @submit.prevent="registerSponsor">
          <div class="mb-3">
            <label for="sponsor-email" class="form-label">Email</label>
            <input type="email" class="form-control" id="sponsor-email" v-model="sponsor.email" required>
            <small v-if="!isEmailValid && sponsor.email" class="form-text text-danger">Invalid email address.</small>
          </div>
          <div class="mb-3">
            <label for="sponsor-password" class="form-label">Password</label>
            <input type="password" class="form-control" id="sponsor-password" v-model="sponsor.password" required>
            <small v-if="!isPasswordValid && sponsor.password" class="form-text text-danger">Password is required.</small>
          </div>
          <div class="mb-3">
            <label for="sponsor-confirm-password" class="form-label">Confirm Password</label>
            <input type="password" class="form-control" id="sponsor-confirm-password" v-model="confirmPassword" required>
            <small v-if="!isPasswordMatch && confirmPassword" class="form-text text-danger">Passwords do not match.</small>
          </div>
          <div class="mb-3">
            <label for="sponsor-industry" class="form-label">Industry</label>
            <input type="text" class="form-control" id="sponsor-industry" v-model="sponsor.industry" required>
            <small v-if="!sponsor.industry && sponsor.industry !== ''" class="form-text text-danger">Industry is required.</small>
          </div>
          <div class="mb-3">
            <label for="sponsor-company-name" class="form-label">Company Name</label>
            <input type="text" class="form-control" id="sponsor-company-name" v-model="sponsor.companyName" required>
            <small v-if="!sponsor.companyName && sponsor.companyName !== ''" class="form-text text-danger">Company name is required.</small>
          </div>
          <div class="mb-3">
            <label for="sponsor-company-url" class="form-label">Company URL</label>
            <input type="url" class="form-control" id="sponsor-company-url" v-model="sponsor.companyUrl">
            <small v-if="!isValidUrl && sponsor.companyUrl" class="form-text text-danger">Invalid URL format.</small>
          </div>
          <div class="mb-3">
            <label for="sponsor-image" class="form-label">Picture</label>
            <div class="input-group">
              <input type="file" class="form-control" id="sponsor-image" @change="handleImageUpload" accept="image/*">
              <label class="input-group-text" for="sponsor-image">Upload</label>
            </div>
          </div>
          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid">Register</button>
          </div>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      sponsor: {
        email: '',
        password: '',
        industry: '',
        companyName: '',
        companyUrl: '',
        companyLogoBlob: null
      },
      confirmPassword: '',
      message: '',
      isSuccess: false,
    };
  },
  computed: {
    isFormValid() {
      return this.isEmailValid && this.isPasswordValid && this.isPasswordMatch && this.sponsor.industry && this.sponsor.companyName;
    },
    isEmailValid() {
      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.sponsor.email);
    },
    isPasswordValid() {
      return this.sponsor.password.length > 0;
    },
    isPasswordMatch() {
      return this.sponsor.password === this.confirmPassword;
    },
    isValidUrl() {
      try {
        new URL(this.sponsor.companyUrl);
        return true;
      } catch {
        return false;
      }
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      this.sponsor.companyLogoBlob = file;
    },
    registerSponsor() {
      if (!this.isFormValid) {
        this.message = 'Please fill in all fields correctly.';
        this.isSuccess = false;
        return;
      }

      const formData = new FormData();
      formData.append('email', this.sponsor.email);
      formData.append('password', this.sponsor.password);
      formData.append('industry', this.sponsor.industry);
      formData.append('company_name', this.sponsor.companyName);
      formData.append('company_url', this.sponsor.companyUrl);
      formData.append('company_logo_blob', this.sponsor.companyLogoBlob);

      fetch('/api/sponsor/profile', {
        method: 'POST',
        body: formData,
      })
        .then((response) =>
          response.json().then((data) => ({ status: response.status, body: data }))
        )
        .then(({ status, body }) => {
          if (status !== 201) {
            throw new Error(body.message || 'Error registering sponsor');
          }
          this.message = body.message;
          this.isSuccess = true;
          this.resetForm();
          setTimeout(() => {
            this.$router.push({ path: '/login' });
          }, 2000);
        })
        .catch((error) => {
          this.message = error.message;
          this.isSuccess = false;
        });
    },
    resetForm() {
      this.sponsor = {
        email: '',
        password: '',
        industry: '',
        companyName: '',
        companyUrl: '',
        companyLogoBlob: null
      };
      this.confirmPassword = '';
    },
  },
};
