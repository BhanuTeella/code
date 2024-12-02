export default {
    template: `
      <div class="container mt-5">
        <h1 class="text-center mb-4">Admin Dashboard</h1>
  
        <div v-if="loading" class="text-center">
          <p>Loading...</p>
        </div>
  
        <div v-if="!loading && error" class="text-center text-danger">
          <p>{{ error }}</p>
        </div>
  
        <div v-if="!loading && !error">
          <div class="row mb-3">
            <div class="col-md-3">
              <div class="card text-white bg-primary mb-3">
                <div class="card-header">Total Influencers</div>
                <div class="card-body">
                  <h5 class="card-title">{{ dashboardStats.influencers }}</h5>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card text-white bg-success mb-3">
                <div class="card-header">Total Sponsors</div>
                <div class="card-body">
                  <h5 class="card-title">{{ dashboardStats.sponsors }}</h5>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card text-white bg-info mb-3">
                <div class="card-header">Total Campaigns</div>
                <div class="card-body">
                  <h5 class="card-title">{{ dashboardStats.campaigns }}</h5>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card text-white bg-danger mb-3">
                <div class="card-header">Total Ad Requests</div>
                <div class="card-body">
                  <h5 class="card-title">{{ dashboardStats.ad_requests }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        dashboardStats: {
          influencers: 0,
          sponsors: 0,
          campaigns: 0,
          ad_requests: 0
        },
        loading: true,
        error: null
      };
    },
    mounted() {
      this.fetchDashboardData();
    },
    methods: {
      async fetchDashboardData() {
        this.loading = true;
        this.error = null;
  
        try {
          const response = await fetch('/api/admin/dashboard', {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('token')
            }
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
  
          const data = await response.json();
          this.dashboardStats = data;
        } catch (error) {
          this.error = error.message;
        } finally {
          this.loading = false;
        }
      }
    }
  };
  