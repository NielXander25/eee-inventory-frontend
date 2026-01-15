// const API_URL = 'http://localhost:4000/api';
const API_URL = 'https://eee-inventory.onrender.com/api';
let token = null;
let currentUser = null;
let orderProducts = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {

  // ✅ Allow login page to load without redirect
  if (window.location.pathname.includes('login.html')) {
    return;
  }

  token = localStorage.getItem('token');

  // ✅ Redirect ONLY if not logged in
  if (!token) {
    window.location.href = 'pages/login.html';
    return;
  }

  const userStr = localStorage.getItem('user');
  currentUser = userStr ? JSON.parse(userStr) : null;
  
  if (currentUser && document.getElementById('userName')) {
    document.getElementById('userName').textContent = currentUser.name;
    
    if (currentUser.role === 'super_admin') {
  const adminLink = document.getElementById('addAdminLink');
  const manageAdminsLink = document.getElementById('manageAdminsLink');

  if (adminLink) adminLink.style.display = 'block';
  if (manageAdminsLink) manageAdminsLink.style.display = 'block';
}

  }
  
  document.getElementById('userButton').addEventListener('click', () => {
    document.getElementById('dropdownMenu').classList.toggle('show');
  });
  
  window.addEventListener('click', (e) => {
    if (!e.target.matches('.user-button') && !e.target.closest('.user-button')) {
      const dropdown = document.getElementById('dropdownMenu');
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    }
  });
});

// ==================== NAVIGATION ====================
async function loadContent(page) {
  const contentArea = document.getElementById('contentArea');
  
  switch(page) {
    case 'profile':
      await loadProfile();
      break;
    case 'add-admin':
      if (currentUser.role === 'super_admin') {
        await loadAddAdmin();
      }
      break;
      case 'manage-admins':
  await loadManageAdmins();
  break;

    case 'category':
      await loadCategory();
      break;
    case 'product':
      await loadProduct();
      break;
    case 'customer':
      await loadCustomer();
      break;
    case 'order':
      await loadOrder();
      break;
    case 'manage-orders':
      await loadManageOrders();
      break;
    default:
      contentArea.innerHTML = '<h1>Welcome to EEE Inventory Management System</h1>';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ==================== PROFILE ====================
async function loadProfile() {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <h1>My Profile</h1>
    <div class="profile-card">
      <div class="profile-info">
        <label>Name:</label>
        <span>${currentUser.name}</span>
      </div>
      <div class="profile-info">
        <label>Email:</label>
        <span>${currentUser.email}</span>
      </div>
      <div class="profile-info">
        <label>Role:</label>
        <span>${currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
      </div>
    </div>
  `;
}

// ==================== ADD ADMIN ====================
async function loadAddAdmin() {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <h1>Add New Admin</h1>
    <div class="form-container">
      <form id="addAdminForm">
        <div class="form-group">
          <label for="adminName">Name</label>
          <input type="text" id="adminName" required>
        </div>
        <div class="form-group">
          <label for="adminEmail">Email</label>
          <input type="email" id="adminEmail" required>
        </div>
        <div class="form-group">
          <label for="adminPassword">Password</label>
          <input type="password" id="adminPassword" required minlength="6">
        </div>
        <button type="submit" class="btn btn-primary">Add Admin</button>
        <div id="adminMessage"></div>
      </form>
    </div>
  `;
  
  document.getElementById('addAdminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const messageDiv = document.getElementById('adminMessage');
    
    try {
      const response = await fetch(`${API_URL}/users/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        messageDiv.className = 'success-message';
        messageDiv.textContent = 'Admin created successfully!';
        document.getElementById('addAdminForm').reset();
      } else {
        messageDiv.className = 'error-message';
        messageDiv.textContent = data.message;
      }
    } catch (error) {
      messageDiv.className = 'error-message';
      messageDiv.textContent = 'An error occurred';
    }
  });
}

// ==================== CATEGORY ====================
async function loadCategory() {
  const contentArea = document.getElementById('contentArea');
  
  contentArea.innerHTML = `
    <h1>Category Management</h1>
    <button class="btn btn-primary" onclick="showCategoryForm()">Add New Category</button>
    
    <div id="categoryFormContainer" style="display:none;">
      <div class="form-container">
        <h2>Add Category</h2>
        <form id="categoryForm">
          <input type="hidden" id="categoryId">
          <div class="form-group">
            <label for="categoryName">Category Name</label>
            <input type="text" id="categoryName" required>
          </div>
          <div class="form-group">
            <label for="categoryDescription">Description</label>
            <textarea id="categoryDescription" required></textarea>
          </div>
          <div class="action-buttons">
            <button type="submit" class="btn btn-success">Save</button>
            <button type="button" class="btn btn-secondary" onclick="hideCategoryForm()">Cancel</button>
          </div>
          <div id="categoryMessage"></div>
        </form>
      </div>
    </div>
    
    <div class="table-container">
      <h2>Categories List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="categoryTableBody">
          <tr><td colspan="4" class="loading">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  await fetchCategories();
  
  document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveCategory();
  });
}

async function fetchCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const tbody = document.getElementById('categoryTableBody');
    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(cat => `
        <tr>
          <td>${cat.name}</td>
          <td>${cat.description}</td>
          <td>${new Date(cat.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="editCategory('${cat._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat._id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="4">No categories found</td></tr>';
    }
  } catch (error) {
    console.error(error);
  }
}

function showCategoryForm() {
  document.getElementById('categoryFormContainer').style.display = 'block';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryId').value = '';
}

function hideCategoryForm() {
  document.getElementById('categoryFormContainer').style.display = 'none';
}

async function saveCategory() {
  const id = document.getElementById('categoryId').value;
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  const messageDiv = document.getElementById('categoryMessage');
  
  const url = id ? `${API_URL}/categories/${id}` : `${API_URL}/categories`;
  const method = id ? 'PUT' : 'POST';
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageDiv.className = 'success-message';
      messageDiv.textContent = id ? 'Category updated!' : 'Category created!';
      hideCategoryForm();
      await fetchCategories();
    } else {
      messageDiv.className = 'error-message';
      messageDiv.textContent = data.message;
    }
  } catch (error) {
    messageDiv.className = 'error-message';
    messageDiv.textContent = 'An error occurred';
  }
}

async function editCategory(id) {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('categoryId').value = data.data._id;
      document.getElementById('categoryName').value = data.data.name;
      document.getElementById('categoryDescription').value = data.data.description;
      showCategoryForm();
    }
  } catch (error) {
    console.error(error);
  }
}

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      await fetchCategories();
    }
  } catch (error) {
    console.error(error);
  }
}

// ==================== PRODUCT ====================
async function loadProduct() {
  const contentArea = document.getElementById('contentArea');
  
  contentArea.innerHTML = `
    <h1>Product Management</h1>
    <button class="btn btn-primary" onclick="showProductForm()">Add New Product</button>
    
    <div id="productFormContainer" style="display:none;">
      <div class="form-container">
        <h2>Add Product</h2>
        <form id="productForm">
          <input type="hidden" id="productId">
          <div class="form-group">
            <label for="productName">Product Name</label>
            <input type="text" id="productName" required>
          </div>
          <div class="form-group">
            <label for="productCategory">Category</label>
            <select id="productCategory" required>
              <option value="">Select Category</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="productPrice">Price</label>
              <input type="number" id="productPrice" step="0.01" min="0" required>
            </div>
            <div class="form-group">
              <label for="productQuantity">Quantity</label>
              <input type="number" id="productQuantity" min="0" required>
            </div>
          </div>
          <div class="form-group">
            <label for="productDescription">Description</label>
            <textarea id="productDescription" required></textarea>
          </div>
          <div class="action-buttons">
            <button type="submit" class="btn btn-success">Save</button>
            <button type="button" class="btn btn-secondary" onclick="hideProductForm()">Cancel</button>
          </div>
          <div id="productMessage"></div>
        </form>
      </div>
    </div>
    
    <div class="table-container">
      <h2>Products List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="productTableBody">
          <tr><td colspan="5" class="loading">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  await fetchCategoriesForProduct();
  await fetchProducts();
  
  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProduct();
  });
}

async function fetchCategoriesForProduct() {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const select = document.getElementById('productCategory');
    if (data.success) {
      data.data.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat._id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const tbody = document.getElementById('productTableBody');
    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(prod => `
        <tr>
          <td>${prod.name}</td>
          <td>${prod.category ? prod.category.name : 'N/A'}</td>
          <td>$${prod.price.toFixed(2)}</td>
          <td>${prod.quantity}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="editProduct('${prod._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${prod._id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="5">No products found</td></tr>';
    }
  } catch (error) {
    console.error(error);
  }
}

function showProductForm() {
  document.getElementById('productFormContainer').style.display = 'block';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
}

function hideProductForm() {
  document.getElementById('productFormContainer').style.display = 'none';
}

async function saveProduct() {
  const id = document.getElementById('productId').value;
  const name = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const price = document.getElementById('productPrice').value;
  const quantity = document.getElementById('productQuantity').value;
  const description = document.getElementById('productDescription').value;
  const messageDiv = document.getElementById('productMessage');
  
  const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
  const method = id ? 'PUT' : 'POST';
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, category, price, quantity, description })
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageDiv.className = 'success-message';
      messageDiv.textContent = id ? 'Product updated!' : 'Product created!';
      hideProductForm();
      await fetchProducts();
    } else {
      messageDiv.className = 'error-message';
      messageDiv.textContent = data.message;
    }
  } catch (error) {
    messageDiv.className = 'error-message';
    messageDiv.textContent = 'An error occurred';
  }
}

async function editProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('productId').value = data.data._id;
      document.getElementById('productName').value = data.data.name;
      document.getElementById('productCategory').value = data.data.category._id || data.data.category;
      document.getElementById('productPrice').value = data.data.price;
      document.getElementById('productQuantity').value = data.data.quantity;
      document.getElementById('productDescription').value = data.data.description;
      showProductForm();
    }
  } catch (error) {
    console.error(error);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      await fetchProducts();
    }
  } catch (error) {
    console.error(error);
  }
}

// ==================== CUSTOMER ====================
async function loadCustomer() {
  const contentArea = document.getElementById('contentArea');
  
  contentArea.innerHTML = `
    <h1>Customer Management</h1>
    <button class="btn btn-primary" onclick="showCustomerForm()">Add New Customer</button>
    
    <div id="customerFormContainer" style="display:none;">
      <div class="form-container">
        <h2>Add Customer</h2>
        <form id="customerForm">
          <input type="hidden" id="customerId">
          <div class="form-group">
            <label for="customerName">Name</label>
            <input type="text" id="customerName" required>
          </div>
          <div class="form-group">
            <label for="customerEmail">Email</label>
            <input type="email" id="customerEmail" required>
          </div>
          <div class="form-group">
            <label for="customerPhone">Phone</label>
            <input type="text" id="customerPhone" required>
          </div>
          <div class="form-group">
            <label for="customerAddress">Address</label>
            <textarea id="customerAddress" required></textarea>
          </div>
          <div class="action-buttons">
            <button type="submit" class="btn btn-success">Save</button>
            <button type="button" class="btn btn-secondary" onclick="hideCustomerForm()">Cancel</button>
          </div>
          <div id="customerMessage"></div>
        </form>
      </div>
    </div>
    
    <div class="table-container">
      <h2>Customers List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="customerTableBody">
          <tr><td colspan="5" class="loading">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  await fetchCustomers();
  
  document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveCustomer();
  });
}

async function fetchCustomers() {
  try {
    const response = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const tbody = document.getElementById('customerTableBody');
    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(cust => `
        <tr>
          <td>${cust.name}</td>
          <td>${cust.email}</td>
          <td>${cust.phone}</td>
          <td>${cust.address}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="editCustomer('${cust._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${cust._id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="5">No customers found</td></tr>';
    }
  } catch (error) {
    console.error(error);
  }
}

function showCustomerForm() {
  document.getElementById('customerFormContainer').style.display = 'block';
  document.getElementById('customerForm').reset();
  document.getElementById('customerId').value = '';
}

function hideCustomerForm() {
  document.getElementById('customerFormContainer').style.display = 'none';
}

async function saveCustomer() {
  const id = document.getElementById('customerId').value;
  const name = document.getElementById('customerName').value;
  const email = document.getElementById('customerEmail').value;
  const phone = document.getElementById('customerPhone').value;
  const address = document.getElementById('customerAddress').value;
  const messageDiv = document.getElementById('customerMessage');
  
  const url = id ? `${API_URL}/customers/${id}` : `${API_URL}/customers`;
  const method = id ? 'PUT' : 'POST';
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, phone, address })
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageDiv.className = 'success-message';
      messageDiv.textContent = id ? 'Customer updated!' : 'Customer created!';
      hideCustomerForm();
      await fetchCustomers();
    } else {
      messageDiv.className = 'error-message';
      messageDiv.textContent = data.message;
    }
  } catch (error) {
    messageDiv.className = 'error-message';
    messageDiv.textContent = 'An error occurred';
  }
}

async function editCustomer(id) {
  try {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('customerId').value = data.data._id;
      document.getElementById('customerName').value = data.data.name;
      document.getElementById('customerEmail').value = data.data.email;
      document.getElementById('customerPhone').value = data.data.phone;
      document.getElementById('customerAddress').value = data.data.address;
      showCustomerForm();
    }
  } catch (error) {
    console.error(error);
  }
}

async function deleteCustomer(id) {
  if (!confirm('Are you sure you want to delete this customer?')) return;
  
  try {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      await fetchCustomers();
    }
  } catch (error) {
    console.error(error);
  }
}

// ==================== ORDER ====================
async function loadOrder() {
  orderProducts = [];
  const contentArea = document.getElementById('contentArea');
  
  contentArea.innerHTML = `
    <h1>Create Order</h1>
    <div class="form-container">
      <form id="orderForm">
        <div class="form-group">
          <label for="orderCustomer">Customer</label>
          <select id="orderCustomer" required>
            <option value="">Select Customer</option>
          </select>
        </div>
        
        <h3>Add Products</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="orderProduct">Product</label>
            <select id="orderProduct">
              <option value="">Select Product</option>
            </select>
          </div>
          <div class="form-group">
            <label for="orderQuantity">Quantity</label>
            <input type="number" id="orderQuantity" min="1" value="1">
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addOrderProduct()">Add Product</button>
        
        <div class="order-items" id="orderItemsList"></div>
        
        <div class="form-group">
          <label>Total Amount: $<span id="totalAmount">0.00</span></label>
        </div>
        
        <div class="action-buttons">
          <button type="submit" class="btn btn-success">Create Order</button>
        </div>
        <div id="orderMessage"></div>
      </form>
    </div>
  `;
  
  await loadCustomersForOrder();
  await loadProductsForOrder();
  
  document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await createOrder();
  });
}

async function loadCustomersForOrder() {
  try {
    const response = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const select = document.getElementById('orderCustomer');
    if (data.success) {
      data.data.forEach(cust => {
        const option = document.createElement('option');
        option.value = cust._id;
        option.textContent = `${cust.name} (${cust.email})`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadProductsForOrder() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const select = document.getElementById('orderProduct');
    if (data.success) {
      data.data.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod._id;
        option.textContent = `${prod.name} - $${prod.price} (Stock: ${prod.quantity})`;
        option.dataset.price = prod.price;
        option.dataset.stock = prod.quantity;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function addOrderProduct() {
  const productSelect = document.getElementById('orderProduct');
  const quantityInput = document.getElementById('orderQuantity');
  
  if (!productSelect.value) {
    alert('Please select a product');
    return;
  }
  
  const productId = productSelect.value;
  const productName = productSelect.options[productSelect.selectedIndex].text.split(' - ')[0];
  const price = parseFloat(productSelect.options[productSelect.selectedIndex].dataset.price);
  const quantity = parseInt(quantityInput.value);
  const stock = parseInt(productSelect.options[productSelect.selectedIndex].dataset.stock);
  
  if (quantity > stock) {
    alert('Quantity exceeds available stock');
    return;
  }
  
  const existingIndex = orderProducts.findIndex(p => p.product === productId);
  if (existingIndex >= 0) {
    orderProducts[existingIndex].quantity += quantity;
  } else {
    orderProducts.push({ product: productId, productName, price, quantity });
  }
  
  renderOrderItems();
  productSelect.value = '';
  quantityInput.value = 1;
}

function renderOrderItems() {
  const list = document.getElementById('orderItemsList');
  let total = 0;
  
  list.innerHTML = orderProducts.map((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    return `
      <div class="order-item">
        <div class="order-item-info">
          <strong>${item.productName}</strong><br>
          Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${subtotal.toFixed(2)}
        </div>
        <div class="order-item-actions">
          <button type="button" class="btn btn-sm btn-danger" onclick="removeOrderProduct(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('totalAmount').textContent = total.toFixed(2);
}

function removeOrderProduct(index) {
  orderProducts.splice(index, 1);
  renderOrderItems();
}

async function createOrder() {
  const customer = document.getElementById('orderCustomer').value;
  const messageDiv = document.getElementById('orderMessage');
  
  if (!customer) {
    messageDiv.className = 'error-message';
    messageDiv.textContent = 'Please select a customer';
    return;
  }
  
  if (orderProducts.length === 0) {
    messageDiv.className = 'error-message';
    messageDiv.textContent = 'Please add at least one product';
    return;
  }
  
  const products = orderProducts.map(p => ({
    product: p.product,
    quantity: p.quantity
  }));
  
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ customer, products })
    });
    
    const data = await response.json();
    
    if (data.success) {
      messageDiv.className = 'success-message';
      messageDiv.textContent = 'Order created successfully!';
      orderProducts = [];
      document.getElementById('orderForm').reset
      ();
renderOrderItems();
} else {
messageDiv.className = 'error-message';
messageDiv.textContent = data.message;
}
} catch (error) {
messageDiv.className = 'error-message';
messageDiv.textContent = 'An error occurred';
}
}

// ==================== MANAGE ORDERS ====================
async function loadManageOrders() {
  const contentArea = document.getElementById('contentArea');
  
  contentArea.innerHTML = `
    <h1>Manage Orders</h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Customer</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="ordersTableBody">
          <tr><td colspan="6" class="loading">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  await fetchOrders();
}

async function fetchOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const tbody = document.getElementById('ordersTableBody');
    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(order => `
        <tr>
          <td>${order.orderNumber}</td>
          <td>${order.customer ? order.customer.name : 'N/A'}</td>
          <td>$${order.totalAmount.toFixed(2)}</td>
          <td>
            <span class="status-badge status-${order.status}">${order.status}</span>
          </td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>
            <select onchange="updateOrderStatus('${order._id}', this.value)">
              <option value="">Update Status</option>
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6">No orders found</td></tr>';
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateOrderStatus(orderId, status) {
  if (!status) return;
  
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (data.success) {
      await fetchOrders();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('An error occurred');
  }
}

// ==================== MANAGE ADMINS ====================
async function loadManageAdmins() {
  const contentArea = document.getElementById('contentArea');

  contentArea.innerHTML = `
    <h1>Manage Admins</h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="adminsTableBody">
          <tr><td colspan="4">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  await fetchAdmins();
}

async function fetchAdmins() {
  const res = await fetch(`${API_URL}/users/admins`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await res.json();
  const tbody = document.getElementById('adminsTableBody');

  if (!data.success || data.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No admins found</td></tr>';
    return;
  }

  tbody.innerHTML = data.data.map(admin => `
    <tr>
      <td>${admin.name}</td>
      <td>${admin.email}</td>
      <td>${new Date(admin.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-danger"
          onclick="deleteAdmin('${admin._id}', '${admin.name}')">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteAdmin(adminId, adminName) {
  if (!confirm(`Are you sure you want to delete ${adminName}?`)) return;

  const res = await fetch(`${API_URL}/users/admin/${adminId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await res.json();

  if (data.success) {
    await fetchAdmins();
  } else {
    alert(data.message);
  }

}


