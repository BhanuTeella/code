export default {
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Campaign Details</h1>

      <div v-if="error" class="text-center text-danger mb-4">
        <p>{{ error }}</p>
      </div>

      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>

      <div v-if="!loading && !error && campaign">
        <div v-if="!isEditing">
          <h5>{{ campaign.name }}</h5>
          <p>{{ campaign.description }}</p>
          <p><strong>Start Date:</strong> {{ campaign.start_date }}</p>
          <p><strong>End Date:</strong> {{ campaign.end_date }}</p>
          <p><strong>Budget:</strong> {{ campaign.budget }}</p>
          <p><strong>Visibility:</strong> {{ campaign.visibility }}</p>
          <p><strong>Goals:</strong> {{ campaign.goals }}</p>
          
          <div class="text-center mb-4">
            <button @click="enableEdit" class="btn btn-secondary">Edit Campaign</button>
            <router-link :to="'/influencers'" class="btn btn-primary ml-2">
              Create Ad Request
            </router-link>
          </div>
        </div>

        <div v-if="isEditing">
          <div class="form-group">
            <label for="name">Name</label>
            <input v-model="campaign.name" type="text" class="form-control" id="name" />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea v-model="campaign.description" class="form-control" id="description"></textarea>
          </div>
          <div class="form-group">
            <label for="start_date">Start Date</label>
            <input v-model="campaign.start_date" type="date" class="form-control" id="start_date" />
          </div>
          <div class="form-group">
            <label for="end_date">End Date</label>
            <input v-model="campaign.end_date" type="date" class="form-control" id="end_date" />
          </div>
          <div class="form-group">
            <label for="budget">Budget</label>
            <input v-model="campaign.budget" type="number" class="form-control" id="budget" />
          </div>
          <div class="form-group">
            <label for="visibility">Visibility</label>
            <select v-model="campaign.visibility" class="form-control" id="visibility">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div class="form-group">
            <label for="goals">Goals</label>
            <textarea v-model="campaign.goals" class="form-control" id="goals"></textarea>
          </div>

          <div class="text-center mb-4">
            <button @click="saveChanges" class="btn btn-success">Save Changes</button>
            <button @click="cancelEdit" class="btn btn-secondary ml-2">Cancel</button>
          </div>
        </div>

        <h2 class="text-center mb-4">Ad Requests</h2>

        <div v-if="adRequests.length === 0" class="text-center mb-4">
          <p>No ad requests found for this campaign. Create one now!</p>
        </div>

        <div v-else class="row">
          <div v-for="adRequest in adRequests" :key="adRequest.id" class="col-md-4 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <p class="card-text"><strong>Requirements:</strong> {{ adRequest.requirements }}</p>
                <p class="card-text"><strong>Payment Amount:</strong> {{ adRequest.payment_amount }}</p>
                <p class="card-text"><strong>Sponsor Message:</strong> {{ adRequest.sponsor_message }}</p>
                <p class="card-text"><strong>Influencer Message:</strong> {{ adRequest.influencer_message }}</p>
                <p class="card-text"><strong>Status:</strong> {{ adRequest.status }}</p>
                <p class="card-text"><strong>Sponsor Amount:</strong> {{ adRequest.sponsor_amount }}</p>
                <p class="card-text"><strong>Influencer Amount:</strong> {{ adRequest.influencer_amount }}</p>
              </div>
              <div class="card-footer text-center">
                <router-link :to="'/adrequest/' + adRequest.id" class="btn btn-primary">
                  View
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      campaign: null,
      adRequests: [],
      loading: true,
      error: null,
      isEditing: false,
    };
  },
  methods: {
    async fetchCampaignDetails() {
      this.loading = true;
      this.error = null;

      try {
        const campaignId = this.$route.params.id;
        const response = await fetch(`/api/sponsor/campaigns/${campaignId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaign details');
        }

        const data = await response.json();
        this.campaign = data;

        // Fetch ad requests for the specific campaign
        const adRequestsResponse = await fetch(`/api/sponsor/adrequests/campaign/${campaignId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (!adRequestsResponse.ok) {
          throw new Error('Failed to fetch ad requests');
        }

        this.adRequests = await adRequestsResponse.json();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    enableEdit() {
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
      this.fetchCampaignDetails(); // Reset to original details
    },
    async saveChanges() {
      try {
        const campaignId = this.$route.params.id;
        const response = await fetch(`/api/sponsor/campaigns/${campaignId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
          body: JSON.stringify(this.campaign),
        });

        if (!response.ok) {
          throw new Error('Failed to update campaign');
        }

        this.isEditing = false;
        await this.fetchCampaignDetails(); // Refresh details after saving
      } catch (error) {
        this.error = error.message;
      }
    },
  },
  mounted() {
    this.fetchCampaignDetails();
  },
};
