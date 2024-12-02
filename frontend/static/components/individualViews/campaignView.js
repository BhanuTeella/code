export default {
    template: `
      <div v-if="campaign">
        <h1>{{ campaign.name }}</h1>
        <p><strong>Description:</strong> {{ campaign.description }}</p>
        <p><strong>Start Date:</strong> {{ new Date(campaign.start_date).toLocaleDateString() }}</p>
        <p v-if="campaign.end_date"><strong>End Date:</strong> {{ new Date(campaign.end_date).toLocaleDateString() }}</p>
        <p><strong>Budget:</strong> {{ campaign.budget }}</p>
        <p><strong>Visibility:</strong> {{ campaign.visibility }}</p>
        <p><strong>Goals:</strong> {{ campaign.goals }}</p>
        <p><strong>Sponsor ID:</strong> {{ campaign.sponsor_id }}</p>
        <p><strong>Flagged:</strong> {{ campaign.is_flagged ? 'Yes' : 'No' }}</p>
        <router-link to="/campaign_management" class="btn btn-primary mt-3">Back to Campaign Management</router-link>
      </div>
      <div v-else>
        <p>Loading...</p>
      </div>
    `,
    data() {
      return {
        campaign: null,
      };
    },
    async created() {
      const campaignId = this.$route.params.id;  
      if (campaignId) {
        await this.fetchCampaign(campaignId);
      } else {
        console.error('No campaign_id provided in route parameters');
      }
    },
    methods: {
      async fetchCampaign(campaignId) {
        try {
          const res = await fetch(`/api/sponsor/campaignsearch/${campaignId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('token'),
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          this.campaign = data;
        } catch (error) {
          console.error('Error fetching campaign:', error);
          this.campaign = null;
        }
      },
    },
  };
  