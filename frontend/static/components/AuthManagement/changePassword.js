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
            <input v-if="selectedCampaign" type="text" class="form-control" :value="selectedCampaign.name" readonly />
            <input v-else type="text" class="form-control" placeholder="Select a campaign" readonly />
          </div>

          <!-- Influencer selection with search dropdown -->
          <div class="form-group dropdown">
            <label for="influencer">Influencer</label>
            <input
              type="text"
              class="form-control"
              placeholder="Search for an influencer..."
              v-model="searchQuery"
              @keyup="filterInfluencers"
            />
            <div v-if="filteredInfluencers.length" class="dropdown-content">
              <a v-for="influencer in filteredInfluencers" :key="influencer.id" @click="selectInfluencer(influencer)">
                {{ influencer.name }}
              </a>
            </div>
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
      </div>
    </div>
  `,
  data() {
    return {
      selectedCampaign: null,
      selectedInfluencer: null,
      campaigns: [],
      influencers: [],
      filteredInfluencers: [],
      searchQuery: '',
      adRequest: {
        requirements: '',
        sponsor_message: '',
        sponsor_amount: null,
      },
      loading: true,
      error: null,
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
    async fetchInfluencers() {
      try {
        const response = await fetch('/api/influencer', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch influencers');
        }

        this.influencers = await response.json();
        this.filteredInfluencers = this.influencers;
      } catch (error) {
        this.error = error.message;
      }
    },
    filterInfluencers() {
      const query = this.searchQuery.toLowerCase();
      this.filteredInfluencers = this.influencers.filter((influencer) =>
        influencer.name.toLowerCase().includes(query)
      );
    },
    selectInfluencer(influencer) {
      this.selectedInfluencer = influencer.id;
      this.searchQuery = influencer.name;
      this.filteredInfluencers = [];
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
            campaign_id: this.selectedCampaign.id,
            influencer_id: this.selectedInfluencer,
            requirements: this.adRequest.requirements,
            sponsor_message: this.adRequest.sponsor_message,
            sponsor_amount: this.adRequest.sponsor_amount,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit ad request');
        }

        // Handle successful submission (e.g., redirect, show message)
      } catch (error) {
        this.error = error.message;
      }
    },
  },
  async mounted() {
    const campaignId = this.$route.params.id;

    if (campaignId) {
      try {
        const response = await fetch(`/api/sponsor/campaigns/${campaignId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load the campaign.');
        }

        this.selectedCampaign = await response.json();
      } catch (error) {
        this.error = error.message;
      }
    } else {
      this.fetchCampaigns();
    }

    this.fetchInfluencers();
    this.loading = false;
  },
};
