# api.sentinus.vision

> 🚀 API Documentation


---

## 📊 Collection Overview

| Metric | Count |
|--------|-------|
| **Total Requests** | 31 |
| **Total Folders** | 7 |
| **HTTP Methods** | DELETE, GET, PATCH, POST |
| **Collection Auth** | basic |

---

## � Table of Contents

### � Quick Links
- [Update Comparison](#update-comparison)
- [Get a Website](#get-a-website)
- [Reprocess Comparison](#reprocess-comparison)
- [Add a Website](#add-a-website)
- [Start a New Test Run](#start-a-new-test-run)
- [Current User Details](#current-user-details)
- [Update a Website](#update-a-website)
- [List Tests](#list-tests)
- [List all Users within Current Organization](#list-all-users-within-current-organization)
- [Delete a Website](#delete-a-website)
- [List Websites](#list-websites)
- [Create Screenshot for URL (NOT async, takes up to 45s)](#create-screenshot-for-url-not-async-takes-up-to-45s)
- [Compare URL vs Uploaded Screenshot (NOT async, takes up to 60s)](#compare-url-vs-uploaded-screenshot-not-async-takes-up-to-60s)
- [Load Screenshot by ID](#load-screenshot-by-id)
- [List TestRuns](#list-testruns)
- [List Pages](#list-pages)
- [Load Processed Screenshot by ID](#load-processed-screenshot-by-id)
- [Get TestRun Details](#get-testrun-details)
- [List Pages: With sorting](#list-pages-with-sorting)
- [Single Image With Previous, Current and Difference Screenshots Side-by-Side](#single-image-with-previous-current-and-difference-screenshots-side-by-side)
- [Send TestRun Notifications](#send-testrun-notifications)
- [List Pages: With pagination](#list-pages-with-pagination)
- [Preview TestRun Notifications](#preview-testrun-notifications)
- [Add a Page](#add-a-page)
- [Delete TestRun Notifications (only Slack)](#delete-testrun-notifications-only-slack)
- [Update a Page: Change URL and  page comment](#update-a-page-change-url-and-page-comment)
- [Cancel TestRun](#cancel-testrun)
- [Update a Page: Pause to exclude from future test runs for now](#update-a-page-pause-to-exclude-from-future-test-runs-for-now)
- [Resume Canceled TestRun](#resume-canceled-testrun)
- [Update a Page: Move to a different page group](#update-a-page-move-to-a-different-page-group)
- [Delete a Page](#delete-a-page)

---

## � Collection Structure

- **📁 Comparisons** (2 files)
  - [📄 Update Comparison](#Update Comparison)
  - [📄 Reprocess Comparison](#Reprocess Comparison)
- **📁 Pages** (8 files)
  - [📄 List Pages](#List Pages)
  - [📄 List Pages: With sorting](#List Pages: With sorting)
  - [📄 List Pages: With pagination](#List Pages: With pagination)
  - [📄 Add a Page](#Add a Page)
  - [📄 Update a Page: Change URL and  page comment](#Update a Page: Change URL and  page comment)
  - [📄 Update a Page: Pause to exclude from future test runs for now](#Update a Page: Pause to exclude from future test runs for now)
  - [📄 Update a Page: Move to a different page group](#Update a Page: Move to a different page group)
  - [📄 Delete a Page](#Delete a Page)
- **📁 Screenshots** (5 files)
  - [📄 Create Screenshot for URL (NOT async, takes up to 45s)](#Create Screenshot for URL (NOT async, takes up to 45s))
  - [📄 Compare URL vs Uploaded Screenshot (NOT async, takes up to 60s)](#Compare URL vs Uploaded Screenshot (NOT async, takes up to 60s))
  - [📄 Load Screenshot by ID](#Load Screenshot by ID)
  - [📄 Load Processed Screenshot by ID](#Load Processed Screenshot by ID)
  - [📄 Single Image With Previous, Current and Difference Screenshots Side-by-Side](#Single Image With Previous, Current and Difference Screenshots Side-by-Side)
- **📁 TestRuns** (7 files)
  - [📄 List TestRuns](#List TestRuns)
  - [📄 Get TestRun Details](#Get TestRun Details)
  - [📄 Send TestRun Notifications](#Send TestRun Notifications)
  - [📄 Preview TestRun Notifications](#Preview TestRun Notifications)
  - [📄 Delete TestRun Notifications (only Slack)](#Delete TestRun Notifications (only Slack))
  - [📄 Cancel TestRun](#Cancel TestRun)
  - [📄 Resume Canceled TestRun](#Resume Canceled TestRun)
- **📁 Tests** (2 files)
  - [📄 Start a New Test Run](#Start a New Test Run)
  - [📄 List Tests](#List Tests)
- **📁 Users** (2 files)
  - [📄 Current User Details](#Current User Details)
  - [📄 List all Users within Current Organization](#List all Users within Current Organization)
- **📁 Websites** (5 files)
  - [📄 Get a Website](#Get a Website)
  - [📄 Add a Website](#Add a Website)
  - [📄 Update a Website](#Update a Website)
  - [📄 Delete a Website](#Delete a Website)
  - [📄 List Websites](#List Websites)

---

## 📋 API Endpoints

### Update Comparison

**PATCH** `{{api_endpoint}}/comparisons/:id`

> **Sequence:** 1 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 119008 |



#### 📝 Request Body

```json
{
&quot;comments&quot;: &quot;TEST&quot;,
&quot;labels&quot;: [1,2,3]
}
```




---
### Get a Website

**GET** `{{api_endpoint}}/websites/:id`

> **Sequence:** 1 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | application/json |



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 31 |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Reprocess Comparison

**GET** `{{api_endpoint}}/comparisons/:id/reprocess`

> **Sequence:** 2 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 119008 |



#### 📝 Request Body

```json
{
&quot;comments&quot;: &quot;TEST&quot;,
&quot;labels&quot;: [1,2,3]
}
```




---
### Add a Website

**POST** `{{api_endpoint}}/websites/`

> **Sequence:** 2 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | application/json |




#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```


#### 📝 Request Body

```json
{
&quot;name&quot;: &quot;Example&quot;,
&quot;prod_domain&quot;: &quot; https://example.com/ &quot;,
&quot;project_id&quot;: 1
}
```




---
### Start a New Test Run

**POST** `{{api_endpoint}}/tests/:test_id/run/`

> **Sequence:** 3 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `test_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Current User Details

**GET** `{{api_endpoint}}/users/me/`

> **Sequence:** 3 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `orderBy` | created_at | ❌ Disabled |
| `orderDir` | desc | ❌ Disabled |
| `limit` | 500 | ❌ Disabled |
| `offset` | 0 | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Update a Website

**PATCH** `{{api_endpoint}}/websites/:id`

> **Sequence:** 3 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | application/json |



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 31 |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```


#### 📝 Request Body

```json
{
&quot;name&quot;: &quot;Example 1&quot;,
&quot;dev_domain&quot;: &quot;https://dev.example.com&quot;
}
```




---
### List Tests

**GET** `{{api_endpoint}}/tests/`

> **Sequence:** 4 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `orderBy` | created_at | ❌ Disabled |
| `orderDir` | desc | ❌ Disabled |
| `limit` | 500 | ❌ Disabled |
| `offset` | 0 | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### List all Users within Current Organization

**GET** `{{api_endpoint}}/users/`

> **Sequence:** 4 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `orderBy` | created_at | ❌ Disabled |
| `orderDir` | desc | ❌ Disabled |
| `limit` | 500 | ❌ Disabled |
| `offset` | 0 | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Delete a Website

**DELETE** `{{api_endpoint}}/websites/:id`

> **Sequence:** 4 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 282 |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### List Websites

**GET** `{{api_endpoint}}/websites/`

> **Sequence:** 5 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `orderBy` | created_at | ❌ Disabled |
| `orderDir` | desc | ❌ Disabled |
| `limit` | 1 | ❌ Disabled |
| `offset` | 0 | ❌ Disabled |
| `cursor` | 1 | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Create Screenshot for URL (NOT async, takes up to 45s)

**GET** `{{api_endpoint}}/screenshot?url&#x3D;https://www.example.com/@!0,1&amp;width&#x3D;1440&amp;height&#x3D;1024`

> **Sequence:** 6 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `url` | https://www.example.com/@!0,1 | ✅ Enabled |
| `width` | 1440 | ✅ Enabled |
| `height` | 1024 | ✅ Enabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Compare URL vs Uploaded Screenshot (NOT async, takes up to 60s)

**POST** `{{api_endpoint}}/compare`

> **Sequence:** 7 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | multipart/form-data |




#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Load Screenshot by ID

**GET** `{{api_endpoint}}/screenshots/:screenshot_id`

> **Sequence:** 8 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `screenshot_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### List TestRuns

**GET** `{{api_endpoint}}/testruns/`

> **Sequence:** 8 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `orderBy` | created_at | ❌ Disabled |
| `orderDir` | desc | ❌ Disabled |
| `limit` | 500 | ❌ Disabled |
| `offset` | 0 | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### List Pages

**GET** `{{api_endpoint}}/pages/`

> **Sequence:** 9 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `orderBy` | created_at | ❌ Disabled |
| `orderDir` | desc | ❌ Disabled |
| `limit` | 500 | ❌ Disabled |
| `offset` | 0 | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Load Processed Screenshot by ID

**GET** `{{api_endpoint}}/screenshots/:screenshot_id/processed/`

> **Sequence:** 9 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `screenshot_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Get TestRun Details

**GET** `{{api_endpoint}}/testruns/:test_run_id/`

> **Sequence:** 9 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `test_run_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### List Pages: With sorting

**GET** `{{api_endpoint}}/pages/?orderBy&#x3D;created_at&amp;orderDir&#x3D;desc`

> **Sequence:** 10 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `orderBy` | created_at | ✅ Enabled |
| `orderDir` | desc | ✅ Enabled |
| `limit` | 500 | ❌ Disabled |
| `offset` | 0 | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Single Image With Previous, Current and Difference Screenshots Side-by-Side

**GET** `{{api_endpoint}}/comparisons/:comparison_id/screenshot/`

> **Sequence:** 10 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `comparison_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Send TestRun Notifications

**GET** `{{api_endpoint}}/testruns/:test_run_id/notify`

> **Sequence:** 10 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `test_run_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### List Pages: With pagination

**GET** `{{api_endpoint}}/pages/?limit&#x3D;50&amp;offset&#x3D;50`

> **Sequence:** 11 | **Type:** http


#### 🔍 Query Parameters

| Parameter | Value | Status |
|-----------|-------|--------|
| `limit` | 50 | ✅ Enabled |
| `offset` | 50 | ✅ Enabled |
| `orderBy` | created_at | ❌ Disabled |
| `orderDir` | desc | ❌ Disabled |



#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Preview TestRun Notifications

**GET** `{{api_endpoint}}/testruns/:test_run_id/notify/preview`

> **Sequence:** 11 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `test_run_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Add a Page

**POST** `{{api_endpoint}}/pages/`

> **Sequence:** 12 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | application/json |




#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```


#### 📝 Request Body

```json
{
&quot;url&quot;: &quot;https://example.org/&quot;,
&quot;comment&quot;: null,
&quot;page_group_id&quot;: {{page_group_id}}
}
```




---
### Delete TestRun Notifications (only Slack)

**DELETE** `{{api_endpoint}}/testruns/:test_run_id/notify`

> **Sequence:** 12 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `test_run_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Update a Page: Change URL and  page comment

**PATCH** `{{api_endpoint}}/pages/:id`

> **Sequence:** 13 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | application/json |



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 282 |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```


#### 📝 Request Body

```json
{
&quot;comment&quot;: &quot;Test comment&quot;,
&quot;url&quot;: &quot;http://example.org&quot;
}
```




---
### Cancel TestRun

**POST** `{{api_endpoint}}/testruns/:test_run_id/cancel`

> **Sequence:** 13 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `test_run_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Update a Page: Pause to exclude from future test runs for now

**PATCH** `{{api_endpoint}}/pages/:id`

> **Sequence:** 14 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | application/json |



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 282 |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```


#### 📝 Request Body

```json
{
&quot;paused_at&quot;: &quot;2024-01-01T01:00:00.000Z&quot;
}
```




---
### Resume Canceled TestRun

**POST** `{{api_endpoint}}/testruns/:test_run_id/resume`

> **Sequence:** 14 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `test_run_id` |  |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---
### Update a Page: Move to a different page group

**PATCH** `{{api_endpoint}}/pages/:id`

> **Sequence:** 15 | **Type:** http

#### 📋 Headers

| Header | Value |
|--------|-------|
| `Content-Type` | application/json |



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 282 |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```


#### 📝 Request Body

```json
{
&quot;page_group_id&quot;: 21
}
```




---
### Delete a Page

**DELETE** `{{api_endpoint}}/pages/:id`

> **Sequence:** 16 | **Type:** http



#### 🛣️ Path Parameters

| Parameter | Value |
|-----------|-------|
| `id` | 282 |


#### 🔒 Authentication

**Type:** Basic Authentication

```
Username: {{username}}
Password: [HIDDEN]
```





---

---

## 📄 Documentation Details

- **📅 Generated on:** July 19, 2025 at 12:48 AM
- **🛠️ Generated by:** Bruno Docs CLI
- **📊 Total Endpoints:** 31
- **📁 Total Folders:** 7

---

> 💡 **Note:** This documentation was automatically generated from Bruno API collection files (.bru)
>
> For more information about Bruno, visit: [https://usebruno.com](https://usebruno.com)
