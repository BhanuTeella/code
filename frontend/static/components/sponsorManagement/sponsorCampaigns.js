export default {
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Campaigns</h1>

      <div class="text-center mb-4">
        <router-link to="/sponsor/create-campaign" class="btn btn-primary">Create Campaign</router-link>
      </div>

      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>

      <div v-if="!loading && error" class="text-center text-danger">
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error">
        <h2 class="text-center mb-4">Total Campaigns: {{ campaigns.length }}</h2>

        <div class="row">
          <div v-for="campaign in campaigns" :key="campaign.id" class="col-md-4 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ campaign.name }}</h5>
                <p class="card-text">{{ campaign.description }}</p>
                <p class="card-text"><strong>Start Date:</strong> {{ campaign.start_date }}</p>
                <p class="card-text"><strong>End Date:</strong> {{ campaign.end_date }}</p>
                <p class="card-text"><strong>Budget:</strong> {{ campaign.budget }}</p>
                <p class="card-text"><strong>Visibility:</strong> {{ campaign.visibility }}</p>
                <router-link :to="'/sponsor/campaign/' + campaign.id" class="btn btn-info btn-sm">View</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      campaigns: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchCampaigns() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Fetching campaigns...');
        const response = await fetch('/api/sponsor/campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        console.log('Response:', response);

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        const data = await response.json();
        console.log('Data:', data);
        this.campaigns = data; // Assuming the response is an array of campaigns
      } catch (error) {
        console.error('Error:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchCampaigns();
  }
};
