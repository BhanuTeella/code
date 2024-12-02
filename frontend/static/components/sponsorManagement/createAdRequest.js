export default {
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Create Ad Request</h1>

      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>

      <div v-if="!loading && error" class="text-center text-danger">
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error">
        <form @submit.prevent="submitAdRequest">
          <!-- Campaign selection -->
          <div class="form-group">
            <label for="campaign">Campaign</label>
            <select v-model="selectedCampaign" class="form-control" required>
              <option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">
                {{ campaign.name }}
              </option>
            </select>
          </div>

          <!-- Influencer selection (uneditable) -->
          <div class="form-group">
            <label for="influencer">Influencer</label>
            <input
              type="text"
              class="form-control"
              :value="influencer.name"
              readonly
            />
          </div>

          <!-- Requirements -->
          <div class="form-group">
            <label for="requirements">Requirements</label>
            <textarea v-model="adRequest.requirements" class="form-control" required></textarea>
          </div>

          <!-- Sponsor message -->
          <div class="form-group">
            <label for="sponsor-message">Sponsor Message</label>
            <textarea v-model="adRequest.sponsor_message" class="form-control"></textarea>
          </div>

          <!-- Sponsor amount -->
          <div class="form-group">
            <label for="sponsor-amount">Sponsor Amount</label>
            <input v-model.number="adRequest.sponsor_amount" type="number" class="form-control" required />
          </div>

          <!-- Submit button -->
          <button type="submit" class="btn btn-primary">Submit Ad Request</button>
        </form>

        <div v-if="successMessage" class="alert alert-success mt-3">
          {{ successMessage }}
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      selectedCampaign: null,
      influencer: {},
      campaigns: [],
      adRequest: {
        requirements: '',
        sponsor_message: '',
        sponsor_amount: null,
      },
      loading: true,
      error: null,
      successMessage: null,
    };
  },
  methods: {
    async fetchCampaigns() {
      try {
        const response = await fetch('/api/sponsor/campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        this.campaigns = await response.json();
      } catch (error) {
        this.error = error.message;
      }
    },
    async fetchInfluencer() {
      const id = this.$route.params.id;
      try {
        const response = await fetch(`/api/influencer/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch influencer');
        }

        this.influencer = await response.json();
      } catch (error) {
        this.error = error.message;
      }
    },
    async submitAdRequest() {
      try {
        const response = await fetch('/api/sponsor/adrequests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
          body: JSON.stringify({
            campaign_id: this.selectedCampaign,
            influencer_id: this.influencer.influencer_id,
            requirements: this.adRequest.requirements,
            sponsor_message: this.adRequest.sponsor_message,
            sponsor_amount: this.adRequest.sponsor_amount,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit ad request');
        }

        const result = await response.json();
        this.successMessage = result.message || 'Ad request created successfully';
        this.adRequest = {
          requirements: '',
          sponsor_message: '',
          sponsor_amount: null,
        }; // Reset form fields
        this.selectedCampaign = null;
      } catch (error) {
        this.error = error.message;
      }
    },
  },
  async mounted() {
    await this.fetchCampaigns();
    await this.fetchInfluencer();
    this.loading = false;
  },
};
