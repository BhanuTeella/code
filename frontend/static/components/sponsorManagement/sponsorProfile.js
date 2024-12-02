export default {
  template: `
    <div class="container-fluid mt-5 d-flex flex-column align-items-center">
    <div class="col-12 col-md-6">
      <h1 class="text-center mb-4">Sponsor Profile</h1>
      <p v-if="message" :class="{'text-success': isSuccess, 'text-danger': !isSuccess}">{{ message }}</p>

      <form @submit.prevent="updateProfile">
        <div class="mb-3">
          <label for="sponsor-image" class="form-label">Company Logo</label>
          <input type="file" class="form-control" id="sponsor-image" @change="handleImageUpload" accept="image/*" :disabled="!isEditing">
          <img v-if="sponsor.companyLogoBlob" :src="'data:image/png;base64,' + sponsor.companyLogoBlob" alt="Company Logo" class="img-fluid mt-3" style="max-height: 300px; max-width: 300px;" />
        </div>
        <div class="mb-3">
          <label for="sponsor-company-name" class="form-label">Company Name</label>
          <input type="text" class="form-control" id="sponsor-company-name" v-model="sponsor.companyName" :disabled="!isEditing" required>
        </div>
        <div class="mb-3">
          <label for="sponsor-industry" class="form-label">Industry</label>
          <input type="text" class="form-control" id="sponsor-industry" v-model="sponsor.industry" :disabled="!isEditing" required>
        </div>
        <div class="mb-3">
          <label for="sponsor-company-url" class="form-label">Company URL</label>
          <input type="text" class="form-control" id="sponsor-company-url" v-model="sponsor.companyUrl" :disabled="!isEditing">
        </div>
        <div class="d-flex justify-content-between">
          <button type="submit" class="btn btn-primary" :disabled="!isEditing || !isFormValid">Update Profile</button>
          <button type="button" class="btn btn-secondary" v-if="!isEditing" @click="editProfile">Edit Profile</button>
          <button type="button" class="btn btn-secondary" v-if="isEditing" @click="isEditing = false">Cancel</button>
          <router-link to="/delete-profile" class="btn btn-danger" v-if="!isEditing" @click="isEditing = false">Delete Profile</router-link>
          <router-link to="/change-password" class="btn btn-secondary" v-if="!isEditing" @click="isEditing = false">Change Password</router-link>
        </div>
      </form>
    </div>
    </div>
  `,
  data() {
    return {
      sponsor: {
        companyName: '',
        industry: '',
        companyUrl: '',
        companyLogoBlob: null
      },
      isEditing: false,
      message: '',
      isSuccess: false
    };
  },
  computed: {
    isFormValid() {
      return this.sponsor.companyName && this.sponsor.industry;
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.sponsor.companyLogoBlob = e.target.result.split(',')[1]; // Store base64 string
      };
      reader.readAsDataURL(file);
    },

    fetchProfile() {
      fetch('/api/sponsor/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token') 
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.sponsor.companyName = data.company_name;
        this.sponsor.industry = data.industry;
        this.sponsor.companyUrl = data.company_url;
        this.sponsor.companyLogoBlob = data.company_logo_blob;
      })
      .catch(error => {
        this.message = error.message;
        this.isSuccess = false;
        console.error("Error fetching profile:", error);
      });
    },

    updateProfile() {
      // Convert image to base64
      let companyLogoBlob = this.sponsor.companyLogoBlob; // Already base64 encoded
      
      fetch('/api/sponsor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token') 
        },
        body: JSON.stringify({
          companyName: this.sponsor.companyName,
          industry: this.sponsor.industry,
          companyUrl: this.sponsor.companyUrl,
          company_logo_blob: companyLogoBlob 
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.message = data.message; 
        this.isSuccess = true;
        this.isEditing = false;
        this.fetchProfile();
      })
      .catch(error => {
        this.message = error.message;
        this.isSuccess = false;
        console.error("Error updating profile:", error);
      });
    },

    editProfile() {
      this.isEditing = true;
    },
  },
  mounted() {
    this.fetchProfile();
  },
};