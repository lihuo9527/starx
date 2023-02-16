import request from './request';

export async function userLogin(data) {
    return request('/app/login', {
        method: 'POST',
        data
    });
}

export async function getUserInfo() {
    return request('/app/user/getUserInfo', { method: 'GET' })
}

export async function fetchUserList(data, current, pageSize) {
    return request(`/app/ad/list?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchBillList(data, current, pageSize) {
    return request(`/charge/ad/list?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function editUser(data) {
    return request('/app/ad/updateStatus', {
        method: 'POST',
        data
    });
}

export async function sendVerifyCode(userId) {
    return request(`/charge/ad/sendCode?userId=${userId}`, { method: 'GET' })
}

export async function userDeposit(data) {
    return request('/charge/ad/recharge', {
        method: 'POST',
        data
    });
}

export async function fetchShelfList(data, current, pageSize) {
    return request(`/shelves/shelves/list?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });

}

export async function addShelf(data) {
    return request('/shelves/shelves/save', {
        method: 'POST',
        data
    });
}

export async function fetchAppointmentOrderList(data, current, pageSize) {
    return request(`/trackingApply/ad/list?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function statusTypeChange(data) {
    return request('/trackingApply/ad/setApplyState', {
        method: 'POST',
        data
    });
}

export async function fetchShelvesNo(trackingNumber) {
    return request(`/trackingApply/ad/distributionInventory?trackingNo=${trackingNumber}`, {
        method: 'POST'
    });
}

export async function distributionPosition(data) {
    return request('/trackingApply/ad/inInventory', {
        method: 'POST',
        data
    });
}

export async function fetchInventoryList(data, current, pageSize) {
    return request(`/inventory/ad/list?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });

}

export async function logout() {
    return request('/app/user/signOut', { method: 'GET' })
}

export async function fetchWorkOrderList(data, current, pageSize) {
    return request(`/ticket/ad/list?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchWorkOrderDetails(data) {
    return request(`/ticket/ad/details?ticketId=${data.id}&userId=${data.userId}`, {
        method: 'GET'
    });
}

export async function workOrderStateChange(data) {
    return request('/ticket/ad/updateTicketState', {
        method: 'POST',
        data
    });
}

export async function workOrderSendMessage(data) {
    return request('/ticketDetail/ad/comment', {
        method: 'POST',
        data
    });
}

export async function fetchOrderListByDomestic(data, current, pageSize) {
    return request(`/outbound/ad/order/domestic?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchOrderListByForward(data, current, pageSize) {
    return request(`/outbound/ad/order/forward?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchOrderListByLift(data, current, pageSize) {
    return request(`/outbound/ad/order/lift?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchOrderListBySell(data, current, pageSize) {
    return request(`/outbound/ad/order/sell?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function orderConfirmOut(stockOutNo) {
    return request(`/outbound/ad/confirm/out?stockOutNo=${stockOutNo}`, {
        method: 'POST'
    });
}

export async function fetchOrderDetailByDomestic(data, current, pageSize) {
    return request(`/outbound/ad/order/domestic/detail?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchOrderDetailByForward(data, current, pageSize) {
    return request(`/outbound/ad/order/forward/detail?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchOrderDetailByLift(data, current, pageSize) {
    return request(`/outbound/ad/order/lift/detail?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function fetchOrderDetailBySell(data, current, pageSize) {
    return request(`/outbound/ad/order/sell/detail?current=${current}&size=${pageSize}`, {
        method: 'POST',
        data
    });
}

export async function expressInformationSubmit(data) {
    return request('/outbound/ad/submit/express/information', {
        method: 'POST',
        data
    });
}

export async function uploadFile(data) {
    return request('/app/common/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data,
    });
}

export async function fetchOrderAmountStatistical() {
    return request('/outbound/ad/order/total/statistical', {
        method: 'POST'
    });
}