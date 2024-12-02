export default {
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Influencer Dashboard</h1>

      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>

      <div v-if="!loading && error" class="text-center text-danger">
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error">
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="card text-white bg-primary mb-3">
              <div class="card-header">Total Accepted Campaigns</div>
              <div class="card-body">
                <h5 class="card-title">{{ dashboardStats.total_campaigns }}</h5>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Total Accepted Ad Requests</div>
              <div class="card-body">
                <h5 class="card-title">{{ dashboardStats.total_ad_requests }}</h5>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-white bg-danger mb-3">
              <div class="card-header">Total Sent Ad Requests</div>
              <div class="card-body">
                <h5 class="card-title">{{ dashboardStats.total_sent_ad_requests }}</h5>
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="card bg-light mb-3">
              <div class="card-header">Ad Request Statuses</div>
              <div class="card-body">
                <ul>
                  <li>Proposed: {{ dashboardStats.proposed_ad_requests }}</li>
                  <li>Accepted: {{ dashboardStats.accepted_ad_requests }}</li>
                  <li>Rejected: {{ dashboardStats.rejected_ad_requests }}</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-light mb-3">
              <div class="card-header">Ongoing Campaigns</div>
              <div class="card-body">
                <ul>
                  <li v-for="campaign in dashboardStats.ongoing_campaigns" :key="campaign.id">
                    {{ campaign.name }} - Start Date: {{ campaign.start_date }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-light mb-3">
              <div class="card-header">New Ad Requests</div>
              <div class="card-body">
                <ul>
                  <li v-for="request in dashboardStats.new_ad_requests" :key="request.id">
                    Campaign: {{ request.campaign_name }} - Requested By: {{ request.requested_by }}
                  </li>
                </ul>
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
        total_campaigns: 0,
        total_ad_requests: 0,
        total_sent_ad_requests: 0,
        proposed_ad_requests: 0,
        accepted_ad_requests: 0,
        rejected_ad_requests: 0,
        ongoing_campaigns: [],
        new_ad_requests: []
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
        const response = await fetch('/api/influencer/dashboard', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        this.dashboardStats = {
          ...data,
          ongoing_campaigns: data.ongoing_campaigns || [],
          new_ad_requests: data.new_ad_requests || []
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
