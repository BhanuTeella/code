export default {
  template: `
    <div class="container-fluid mt-5 d-flex flex-column align-items-center">
      <div class="col-12 col-md-6">
        <h1 class="text-center mb-4">Influencer Registration</h1>
        <p v-if="message" :class="{'text-success': isSuccess, 'text-danger': !isSuccess}">{{ message }}</p>
        <form @submit.prevent="registerInfluencer">
          <div class="mb-3">
            <label for="influencer-name" class="form-label">Name</label>
            <input type="text" class="form-control" id="influencer-name" v-model="influencer.name" required>
          </div>
          <div class="mb-3">
            <label for="influencer-category" class="form-label">Category</label>
            <input type="text" class="form-control" id="influencer-category" v-model="influencer.category" required>
          </div>
          <div class="mb-3">
            <label for="influencer-email" class="form-label">Email</label>
            <input type="email" class="form-control" id="influencer-email" v-model="influencer.email" required>
          </div>
          <div class="mb-3">
            <label for="influencer-password" class="form-label">Password</label>
            <input type="password" class="form-control" id="influencer-password" v-model="influencer.password" required>
          </div>
          <div class="mb-3">
            <label for="influencer-confirm-password" class="form-label">Confirm Password</label>
            <input type="password" class="form-control" id="influencer-confirm-password" v-model="confirmPassword" required>
            <p v-if="passwordMismatch" class="text-danger">Passwords do not match.</p>
          </div>
          <div class="mb-3">
            <label for="influencer-reach" class="form-label">Reach</label>
            <input type="text" class="form-control" id="influencer-reach" v-model="influencer.reach" required>
          </div>
          <div class="mb-3">
            <label for="influencer-instagram-url" class="form-label">Instagram URL</label>
            <input type="url" class="form-control" id="influencer-instagram-url" v-model="influencer.instagramUrl">
          </div>
          <div class="mb-3">
            <label for="influencer-twitter-url" class="form-label">Twitter URL</label>
            <input type="url" class="form-control" id="influencer-twitter-url" v-model="influencer.twitterUrl">
          </div>
          <div class="mb-3">
            <label for="influencer-facebook-url" class="form-label">Facebook URL</label>
            <input type="text" class="form-control" id="influencer-facebook-url" v-model="influencer.facebookUrl">
          </div>
          <div class="mb-3">
            <label for="influencer-picture" class="form-label">Picture</label>
            <div class="input-group">
              <input type="file" class="form-control" id="influencer-picture" @change="handleImageUpload" accept="image/*">
              <label class="input-group-text" for="influencer-picture">Upload</label>
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
      influencer: {
        name: '',
        category: '',
        email: '',
        password: '',
        reach: '',
        instagramUrl: '',
        twitterUrl: '',
        facebookUrl: '',
        picture: null,
      },
      confirmPassword: '',
      message: '',
      isSuccess: false,
    };
  },
  computed: {
    isFormValid() {
      return (
        this.influencer.name &&
        this.influencer.category &&
        this.influencer.email &&
        this.influencer.password &&
        this.influencer.password === this.confirmPassword &&
        this.influencer.reach
      );
    },
    passwordMismatch() {
      return this.influencer.password && this.confirmPassword && this.influencer.password !== this.confirmPassword;
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      this.influencer.picture = file;
    },
    registerInfluencer() {
      if (!this.isFormValid) {
        this.message = "Please fill in all fields correctly.";
        this.isSuccess = false;
        return;
      }

      const formData = new FormData();
      formData.append('name', this.influencer.name);
      formData.append('category', this.influencer.category);
      formData.append('email', this.influencer.email);
      formData.append('password', this.influencer.password);
      formData.append('reach', this.influencer.reach);
      formData.append('instagram_url', this.influencer.instagramUrl);
      formData.append('twitter_url', this.influencer.twitterUrl);
      formData.append('facebook_url', this.influencer.facebookUrl);
      formData.append('picture', this.influencer.picture);

      fetch('/api/influencer/register', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 201) {
          throw new Error(body.message || 'Error registering influencer');
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
      this.influencer = {
        name: '',
        category: '',
        email: '',
        password: '',
        reach: '',
        instagramUrl: '',
        twitterUrl: '',
        facebookUrl: '',
        picture: null,
      };
      this.confirmPassword = '';
    },
  },
};
