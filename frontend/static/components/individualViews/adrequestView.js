export default {
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Ad Request Details</h1>
      <p v-if="message" :class="{'text-success': isSuccess, 'text-danger': !isSuccess}">{{ message }}</p>

      <div v-if="adRequest">
        <form>
          <!-- Campaign Name - Always Disabled -->
          <div class="mb-3">
            <label for="campaign-name" class="form-label">Campaign Name</label>
            <input type="text" class="form-control" id="campaign-name" v-model="campaignName" disabled>
          </div>

          <!-- Influencer Name - Always Disabled -->
          <div class="mb-3">
            <label for="influencer-name" class="form-label">Influencer Name</label>
            <input type="text" class="form-control" id="influencer-name" v-model="influencerName" disabled>
          </div>

          <!-- Requirements Section - Editable by Sponsor -->
          <div class="mb-3">
            <label for="requirements" class="form-label">Requirements</label>
            <textarea class="form-control" id="requirements" v-model="adRequest.requirements" :disabled="!isEditingRequirements"></textarea>
          </div>

          <!-- Sponsor Message - Editable during negotiation by Sponsor -->
          <div class="mb-3">
            <label for="sponsor-message" class="form-label">Sponsor Message</label>
            <textarea class="form-control" id="sponsor-message" v-model="adRequest.sponsor_message" :disabled="!isEditingNegotiation || !isSponsor"></textarea>
          </div>

          <!-- Sponsor Amount - Editable during negotiation by Sponsor -->
          <div class="mb-3">
            <label for="sponsor-amount" class="form-label">Sponsor Amount</label>
            <input type="number" class="form-control" id="sponsor-amount" v-model="adRequest.sponsor_amount" :disabled="!isEditingNegotiation || !isSponsor">
          </div>

          <!-- Influencer Message - Editable during negotiation by Influencer -->
          <div class="mb-3">
            <label for="influencer-message" class="form-label">Influencer Message</label>
            <textarea class="form-control" id="influencer-message" v-model="adRequest.influencer_message" :disabled="!isEditingNegotiation || !isInfluencer"></textarea>
          </div>

          <!-- Influencer Amount - Editable during negotiation by Influencer -->
          <div class="mb-3">
            <label for="influencer-amount" class="form-label">Influencer Amount</label>
            <input type="number" class="form-control" id="influencer-amount" v-model="adRequest.influencer_amount" :disabled="!isEditingNegotiation || !isInfluencer">
          </div>
        </form>
        <div class="d-flex justify-content-between" v-if="!isAdRequestAccepted">
          <!-- Edit Requirements Button - Visible only to Sponsor -->
          <button type="button" class="btn btn-secondary" v-if="!isEditingRequirements && isSponsor && !isHidden" @click="editRequirements(); Hide()">Edit Requirements</button>
          
          <!-- Negotiate Button - Visible to both Sponsor and Influencer -->
          <button type="button" class="btn btn-secondary" v-if="!isEditingNegotiation && !isHidden" @click="negotiate(); Hide()">Negotiate</button>

          <!-- Submit and Cancel Buttons - Visible during Editing Requirements or Negotiation -->
          <button type="button" class="btn btn-primary" v-if="isEditingRequirements" @click="submitAdRequestChanges">Submit</button>
          <button type="button" class="btn btn-primary" v-if="isEditingNegotiation" @click="submitAdRequestChanges">Submit</button>
          <button type="button" class="btn btn-secondary" v-if="isEditingRequirements" @click="cancelEditingRequirements">Cancel</button>
          <button type="button" class="btn btn-secondary" v-if="isEditingNegotiation" @click="cancelEditingNegotiation">Cancel</button>

          <!-- Accept and Reject Buttons - Visible to the other party -->
          <button type="button" class="btn btn-success" v-if="canAccept && !isHidden" @click="acceptAdRequest">Accept</button>
          <button type="button" class="btn btn-danger" v-if="canReject && !isHidden" @click="rejectAdRequest">Reject</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      adRequest: null,
      campaignName: '',
      influencerName: '',
      isEditingRequirements: false,
      isEditingNegotiation: false,
      message: '',
      isSuccess: false,
      isHidden: false
    };
  },
  computed: {
    userRole() {
      return localStorage.getItem('role'); // Fetch role from local storage
    },
    isSponsor() {
      return this.userRole === 'sponsor';
    },
    isInfluencer() {
      return this.userRole === 'influencer';
    },
    canAccept() {
      return (this.isSponsor && this.adRequest.requested_by === 'influencer') || 
             (this.isInfluencer && this.adRequest.requested_by === 'sponsor');
    },
    canReject() {
      return (this.isSponsor && this.adRequest.requested_by === 'influencer') || 
             (this.isInfluencer && this.adRequest.requested_by === 'sponsor');
    },
    isAdRequestAccepted() {
      return this.adRequest && this.adRequest.status === 'accepted'; 
    }
  },
  methods: {
    async fetchAdRequest() {
      try {
        const adRequestRes = await fetch(`/api/sponsor/adrequests/${this.$route.params.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (!adRequestRes.ok) throw new Error("Error fetching ad request");

        const adRequestData = await adRequestRes.json();
        this.adRequest = adRequestData;

        // Fetch campaign name
        const campaignRes = await fetch(`/api/sponsor/campaignsearch/${adRequestData.campaign_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (!campaignRes.ok) throw new Error("Error fetching campaign");

        const campaignData = await campaignRes.json();
        this.campaignName = campaignData.name;

        // Fetch influencer name
        const influencerRes = await fetch(`/api/influencer/${adRequestData.influencer_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (!influencerRes.ok) throw new Error("Error fetching influencer");

        const influencerData = await influencerRes.json();
        this.influencerName = influencerData.name;

      } catch (error) {
        this.message = error.message;
        this.isSuccess = false;
      }
    },
    async submitAdRequestChanges(event) {
      event.preventDefault(); // Prevent default form submission

      try {
        const res = await fetch(`/api/sponsor/adrequests/${this.$route.params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          },
          body: JSON.stringify(this.adRequest)
        });

        if (!res.ok) throw new Error("Error updating ad request");

        this.message = "Ad request updated successfully";
        this.isSuccess = true;
        this.isEditingRequirements = false;
        this.isEditingNegotiation = false;
        this.isHidden = false;
        this.fetchAdRequest(); // Refresh the data
      } catch (error) {
        this.message = error.message;
        this.isSuccess = false;
      }
    },
    async cancelEditingRequirements() {
      this.isEditingRequirements = false;
    },
    async cancelEditingNegotiation() {
      this.isEditingNegotiation = false;
    },
    editRequirements() {
      this.isEditingRequirements = true;
    },
    negotiate() {
      this.isEditingNegotiation = true;
    },
    Hide() {
      this.isHidden = true;
    },
    acceptAdRequest() {
      fetch(`/api/sponsor/adrequests/${this.$route.params.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token')
        },
        body: JSON.stringify({ action: 'accept' })
      })
      .then(response => response.json())
      .then(data => {
        this.message = "Ad request accepted successfully";
        this.isSuccess = true;
        this.fetchAdRequest(); // Refresh the data
      })
      .catch(error => {
        this.message = "Error accepting ad request";
        this.isSuccess = false;
      });
    },
    rejectAdRequest() {
      fetch(`/api/sponsor/adrequests/${this.$route.params.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token')
        },
        body: JSON.stringify({ action: 'reject' })
      })
      .then(response => response.json())
      .then(data => {
        this.message = "Ad request rejected successfully";
        this.isSuccess = true;
        this.fetchAdRequest(); // Refresh the data
      })
      .catch(error => {
        this.message = "Error rejecting ad request";
        this.isSuccess = false;
      });
    }
  },
  created() {
    this.fetchAdRequest();
  }
};
