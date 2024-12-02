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
        <!-- Campaign name (pre-filled) -->
        <div class="form-group">
          <label for="campaign">Campaign</label>
          <input
            type="text"
            class="form-control"
            :value="campaignName"
            readonly
          />
        </div>

        <!-- Influencer name (pre-filled) -->
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

        <!-- Influencer message -->
        <div class="form-group">
          <label for="Influencer-message">Influencer Message</label>
          <textarea v-model="adRequest.influencer_message" class="form-control"></textarea>
        </div>

        <!-- Influencer amount -->
        <div class="form-group">
          <label for="Influencer-amount">Influencer Amount</label>
          <input v-model.number="adRequest.influencer_amount" type="number" class="form-control" required />
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
          influencer: {},
          campaignName: '',
          adRequest: {
            requirements: '',
            influencer_message: '',
            influencer_amount: null,
          },
          loading: true,
          error: null,
          successMessage: null,
        };
      },
      methods: {
        async fetchInfluencer() {
          try {
            const response = await fetch('/api/influencer/profile', {
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('token'),
              },
            });
    
            if (!response.ok) {
              throw new Error('Failed to fetch influencer profile');
            }
    
            this.influencer = await response.json();
          } catch (error) {
            this.error = error.message;
          }
        },
        async fetchCampaign() {
          const campaignId = this.$route.params.campaignId;
          try {
            const response = await fetch(`/api/sponsor/campaignsearch/${campaignId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('token'),
              },
            });
    
            if (!response.ok) {
              throw new Error('Failed to fetch campaign');
            }
    
            const campaign = await response.json();
            this.campaignName = campaign.name;
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
                campaign_id: this.$route.params.campaignId,
                influencer_id: this.influencer.id,
                requirements: this.adRequest.requirements,
                influencer_message: this.adRequest.influencer_message,
                influencer_amount: this.adRequest.influencer_amount,
              }),
            });
    
            if (!response.ok) {
              throw new Error('Failed to submit ad request');
            }
    
            const result = await response.json();
            this.successMessage = result.message || 'Ad request created successfully';
            this.adRequest = {
              requirements: '',
              influencer_message: '',
              influencer_amount: null,
            }; // Reset form fields
          } catch (error) {
            this.error = error.message;
          }
        },
      },
      async mounted() {
        await this.fetchInfluencer();
        await this.fetchCampaign();
        this.loading = false;
      },
    };