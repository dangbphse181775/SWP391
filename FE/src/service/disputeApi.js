import axiosClient from './axiosClient';

const disputeApi = {
    // Get all pending disputes (open / investigating)
    getPendingDisputes() {
        return axiosClient.get('/Dispute/pending');
    },

    // Get all disputes (including resolved)
    getAllDisputes() {
        return axiosClient.get('/Dispute/all');
    },

    // Get dispute detail by ID
    getDisputeDetail(id) {
        return axiosClient.get(`/Dispute/${id}`);
    },

    // Start investigation on a dispute
    investigateDispute(id) {
        return axiosClient.put(`/Dispute/${id}/investigate`);
    },

    // Resolve a dispute with decision
    // body: { resolution, adminNote, refundPercentage? }
    resolveDispute(id, data) {
        return axiosClient.post(`/Dispute/${id}/resolve`, data);
    },

    // Buyer opens a dispute on an order
    // body: { description, evidenceUrls? }
    openDispute(orderId, data) {
        return axiosClient.post(`/Dispute/${orderId}`, data);
    },

    // Get chat history for a dispute channel
    getChatHistory(disputeId, channel) {
        return axiosClient.get(`/Dispute/${disputeId}/chats/${channel}`);
    },

    // Get dispute by order ID
    getDisputeByOrder(orderId) {
        return axiosClient.get(`/Dispute/order/${orderId}`);
    },

    // Seller responds to a dispute
    // body: { response: string }
    sellerResponse(orderId, data) {
        return axiosClient.put(`/Dispute/${orderId}/seller-response`, data);
    }
};

export default disputeApi;
