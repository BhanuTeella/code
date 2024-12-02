export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand">Influencer Engagement Platform</router-link> 
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul class="navbar-nav">

            <li v-if="role === 'sponsor'" class="nav-item">
              <router-link class="nav-link" to="/sponsor/home">Home</router-link>
            </li>
            <li v-if="role === 'sponsor'" class="nav-item">
              <router-link class="nav-link" to="/sponsor/profile">Profile</router-link>
            </li>
            <li v-if="role === 'sponsor'" class="nav-item">
              <router-link class="nav-link" to="/sponsor/campaigns">Campaigns</router-link>
            </li>
            <li v-if="role === 'sponsor'" class="nav-item">
              <router-link class="nav-link" to="/influencers">Influencers</router-link>
            </li>


            <li v-if="role === 'influencer'" class="nav-item">
              <router-link class="nav-link" to="/influencer/home">Home</router-link>
            </li>
            <li v-if="role === 'influencer'" class="nav-item">
              <router-link class="nav-link" to="/influencer/profile">Profile</router-link>
            </li>
            <li v-if="role === 'influencer'" class="nav-item">
              <router-link class="nav-link" to="/campaigns">Campaigns</router-link>
            </li>
            <li v-if="role === 'influencer'" class="nav-item">
              <router-link class="nav-link" to="/influencer/adrequests">Ad Requests</router-link>
            </li>

            
            <li v-if="role === 'admin'" class="nav-item">
              <router-link class="nav-link" to="/admin/home">Home</router-link>
            </li>
            <li v-if="isLoggedIn && role === 'admin'" class="nav-item">
              <router-link class="nav-link" to="/admin/sponsor-management">Sponsor Management</router-link>
            </li>
            <li v-if="isLoggedIn && role === 'admin'" class="nav-item">
              <router-link class="nav-link" to="/admin/influencer-management">Influencer Management</router-link>
            </li>
            <li v-if="isLoggedIn && role === 'admin'" class="nav-item">
              <router-link class="nav-link" to="/admin/campaign-management">Campaign Management</router-link>
            </li>
            <li v-if="isLoggedIn && role === 'admin'" class="nav-item">
              <router-link class="nav-link" to="/change-password">Change Password</router-link>
            </li>
            <li v-if="isLoggedIn" class="nav-item">
              <button class="btn btn-outline-secondary" @click="logout">Logout</button>
            </li>
            <li v-if="!isLoggedIn" class="nav-item">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      role: localStorage.getItem('role'),
      isLoggedIn: !!localStorage.getItem('token'),
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      localStorage.removeItem('email');
      window.location.href = '/';
    },
  },
};
