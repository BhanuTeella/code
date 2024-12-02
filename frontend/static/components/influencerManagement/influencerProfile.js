export default {
  template: `
    <div class="container-fluid mt-5 d-flex flex-column align-items-center">
      <div class="col-12 col-md-6">
        <h1 class="text-center mb-4">Influencer Profile</h1>
        <p v-if="message" :class="{'text-success': isSuccess, 'text-danger': !isSuccess}">{{ message }}</p>

        <form @submit.prevent="updateProfile">
          <div class="mb-3">
            <label for="influencer-picture" class="form-label">Picture</label>
            <input type="file" class="form-control" id="influencer-picture" @change="handleImageUpload" accept="image/*" :disabled="!isEditing">
            <img v-if="influencer.picture" :src="'data:image/png;base64,' + influencer.picture" alt="Influencer Picture" class="img-fluid mt-3" style="max-height: 300px; max-width: 300px;" />
          </div>
          <div class="mb-3">
            <label for="influencer-name" class="form-label">Name</label>
            <input type="text" class="form-control" id="influencer-name" v-model="influencer.name" :disabled="!isEditing" required>
          </div>
          <div class="mb-3">
            <label for="influencer-category" class="form-label">Category</label>
            <input type="text" class="form-control" id="influencer-category" v-model="influencer.category" :disabled="!isEditing" required>
          </div>
          <div class="mb-3">
            <label for="influencer-reach" class="form-label">Reach</label>
            <input type="text" class="form-control" id="influencer-reach" v-model="influencer.reach" :disabled="!isEditing" required>
          </div>
          <div class="mb-3">
            <label for="influencer-instagram-url" class="form-label">Instagram URL</label>
            <input type="text" class="form-control" id="influencer-instagram-url" v-model="influencer.instagramUrl" :disabled="!isEditing">
          </div>
          <div class="mb-3">
            <label for="influencer-twitter-url" class="form-label">Twitter URL</label>
            <input type="text" class="form-control" id="influencer-twitter-url" v-model="influencer.twitterUrl" :disabled="!isEditing">
          </div>
          <div class="mb-3">
            <label for="influencer-facebook-url" class="form-label">Facebook URL</label>
            <input type="text" class="form-control" id="influencer-facebook-url" v-model="influencer.facebookUrl" :disabled="!isEditing">
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
      influencer: {
        name: '',
        category: '',
        reach: '',  // Added reach field
        instagramUrl: '',
        twitterUrl: '',
        facebookUrl: '',
        picture: null,
      },
      isEditing: false,
      message: '',
      isSuccess: false,
    };
  },
  computed: {
    isFormValid() {
      return this.influencer.name && this.influencer.category && this.influencer.reach;
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.influencer.picture = e.target.result.split(',')[1]; // Store only the base64 string
      };
      reader.readAsDataURL(file);
    },
    fetchProfile() {
      fetch('/api/influencer/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token'), // Adjust this as per your token storage
        },
      })
      .then(response => response.json())
      .then(data => {
        this.influencer.name = data.name;
        this.influencer.category = data.category;
        this.influencer.reach = data.reach;  // Fetch reach from profile data
        this.influencer.instagramUrl = data.instagram_url;
        this.influencer.twitterUrl = data.twitter_url;
        this.influencer.facebookUrl = data.facebook_url;
        this.influencer.picture = data.picture;
      })
      .catch(error => {
        console.error("Error fetching profile:", error);
      });
    },
    updateProfile() {
      fetch('/api/influencer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token'), // Adjust this as per your token storage
        },
        body: JSON.stringify(this.influencer),
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 200) {
          throw new Error(body.message || 'Error updating profile');
        }
        this.message = body.message;
        this.isSuccess = true;
        this.isEditing = false;
        this.fetchProfile(); // Refresh the profile data after update
      })
      .catch(error => {
        this.message = error.message;
        this.isSuccess = false;
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
