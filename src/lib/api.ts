const API_BASE_URL = '/api';

const originalFetch = typeof window !== 'undefined' ? window.fetch : global.fetch;

const fetch = async (url: RequestInfo | URL | string, options?: RequestInit) => {
    try {
        const response = await originalFetch(url, options);
        return response;
    } catch (error: any) {
        // Return a mock response that behaves like a 503 Service Unavailable
        // This prevents the Unhandled Runtime Error overlay in Next.js from NetworkError
        return new Response(
            JSON.stringify({ message: `Network Error: ${error.message || 'Failed to connect to server'}` }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

const getAuthHeaders = () => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

// For FormData/file uploads — do NOT set Content-Type, let the browser handle it
const getAuthHeadersMultipart = () => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;
    return {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        localStorage.removeItem('userInfo');
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
        let message = 'Something went wrong';
        if (isJson) {
            const error = await response.json();
            message = error.message || message;
        } else {
            message = await response.text();
            if (message.length > 200) message = message.substring(0, 200) + '...';
        }
        throw new Error(message);
    }

    if (!isJson) {
        const text = await response.text();
        if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
            throw new Error('Server returned HTML instead of JSON. This often happens due to a misconfigured API route or redirected authentication.');
        }
        return text;
    }

    return response.json();
};

// Auth APIs
export const login = (data: any) =>
    fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const register = (data: any) =>
    fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const forgotPassword = (email: string) =>
    fetch(`${API_BASE_URL}/users/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    }).then(handleResponse);

export const resetPassword = (token: string, data: any) =>
    fetch(`${API_BASE_URL}/users/resetpassword/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

// Workspace APIs
export const fetchWorkspaces = () =>
    fetch(`${API_BASE_URL}/workspaces`).then(handleResponse);

export const fetchWorkspaceById = (id: string) =>
    fetch(`${API_BASE_URL}/workspaces/${id}`).then(handleResponse);

export const createWorkspace = (data: any) =>
    fetch(`${API_BASE_URL}/workspaces`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const updateWorkspace = (id: string, data: any) =>
    fetch(`${API_BASE_URL}/workspaces/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteWorkspace = (id: string) =>
    fetch(`${API_BASE_URL}/workspaces/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const fetchMyWorkspace = () =>
    fetch(`${API_BASE_URL}/workspaces/my-workspace`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const fetchUpcomingWorkspace = () =>
    fetch(`${API_BASE_URL}/workspaces/upcoming-workspace`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const fetchCommunityMembers = () =>
    fetch(`${API_BASE_URL}/workspaces/community`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const uploadWorkspaceImages = (id: string, formData: FormData) =>
    fetch(`${API_BASE_URL}/workspaces/${id}/images`, {
        method: 'POST',
        headers: getAuthHeadersMultipart(),
        body: formData,
    }).then(handleResponse);

export const updateProfile = (data: any) =>
    fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const fetchUserProfile = () =>
    fetch(`${API_BASE_URL}/users/profile`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

// User APIs
export const fetchUsers = () =>
    fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const createUser = (data: any) =>
    fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const updateUser = (id: string, data: any) =>
    fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteUser = (id: string) =>
    fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);

// Request APIs
export const submitQuoteRequest = (data: any) =>
    fetch(`${API_BASE_URL}/requests/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const fetchQuoteRequests = () =>
    fetch(`${API_BASE_URL}/requests/quote`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const submitContactRequest = (data: any) =>
    fetch(`${API_BASE_URL}/requests/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const fetchContactRequests = () =>
    fetch(`${API_BASE_URL}/requests/contact`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const fetchDashboardStats = () =>
    fetch(`${API_BASE_URL}/requests/stats`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const updateQuoteRequest = (id: string, status: string) =>
    fetch(`${API_BASE_URL}/requests/quote/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    }).then(handleResponse);

export const updateContactRequest = (id: string, status: string) =>
    fetch(`${API_BASE_URL}/requests/contact/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    }).then(handleResponse);

export const submitBookingRequest = (data: any) =>
    fetch(`${API_BASE_URL}/requests/booking`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const fetchBookingRequests = () =>
    fetch(`${API_BASE_URL}/requests/booking`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const updateBookingRequest = (id: string, status: string) =>
    fetch(`${API_BASE_URL}/requests/booking/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    }).then(handleResponse);

export const submitVisitRequest = (data: any) =>
    fetch(`${API_BASE_URL}/requests/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const fetchVisitRequests = () =>
    fetch(`${API_BASE_URL}/requests/visit`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const updateVisitRequest = (id: string, status: string) =>
    fetch(`${API_BASE_URL}/requests/visit/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    }).then(handleResponse);

export const fetchInvoices = () =>
    fetch(`${API_BASE_URL}/requests/invoices`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const payInvoice = (id: string) =>
    fetch(`${API_BASE_URL}/requests/invoices/${id}/pay`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const generateMonthlyInvoices = () =>
    fetch(`${API_BASE_URL}/requests/invoices/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const resetMonthlyInvoices = () =>
    fetch(`${API_BASE_URL}/requests/invoices`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);

// Post APIs
export const fetchPosts = () =>
    fetch(`${API_BASE_URL}/posts`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const createPost = (data: any) =>
    fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

// Day Pass APIs
export const submitDayPass = (data: any) =>
    fetch(`${API_BASE_URL}/day-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);

export const fetchDayPasses = () =>
    fetch(`${API_BASE_URL}/day-pass`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const verifyDayPass = (passCode: string) =>
    fetch(`${API_BASE_URL}/day-pass/verify/${passCode}`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const upvotePost = (id: string) =>
    fetch(`${API_BASE_URL}/posts/${id}/upvote`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const addComment = (id: string, data: any) =>
    fetch(`${API_BASE_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deletePost = (id: string) =>
    fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const upvoteComment = (postId: string, commentId: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/upvote`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const deleteComment = (postId: string, commentId: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const addReply = (postId: string, commentId: string, data: any) =>
    fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteReply = (postId: string, commentId: string, replyId: string) =>
    fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);

// Agreement APIs
export const fetchAgreements = () =>
    fetch(`${API_BASE_URL}/agreements`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const uploadAgreement = (formData: FormData) =>
    fetch(`${API_BASE_URL}/agreements`, {
        method: 'POST',
        headers: getAuthHeadersMultipart(),
        body: formData,
    }).then(handleResponse);

export const deleteAgreement = (id: string) =>
    fetch(`${API_BASE_URL}/agreements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);
