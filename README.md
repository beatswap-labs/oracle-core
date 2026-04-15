# oracle-core

`oracle-core` is the core backend system of the oracle infrastructure that powers **BeatSwap.io** and its partner ecosystem. It provides secure and scalable APIs for price data, token distribution, transaction handling, and on-chain/off-chain integration.

This service acts as the hub for coordinating data flow between the BeatSwap frontend, partner services, and Internet Computer Protocol (ICP) canisters.

---

## 🌐 Project Overview

* Serves as the **central oracle engine**
* Powers **[https://beatswap.io](https://beatswap.io)** and provides **RESTful APIs** to partner platforms
* Handles **data aggregation**, **token distribution automation**, and **interactions with smart contracts** on the ICP network
* Supports **secure communication** and **asynchronous job processing**

---

## 🚀 Features

* ✅ Real-time oracle data services
* ✅ REST API for external integrations
* ✅ Automated token mint/distribution support
* ✅ Integration with ICP Motoko canisters
* ✅ Transaction logging and monitoring
* ✅ Partner authentication system
* ✅ Modular architecture for scalability

---

## 🛠 Tech Stack

| Layer                  | Technology                         |
| ---------------------- | ---------------------------------- |
| Backend Framework      | **NestJS**                         |
| Blockchain Integration | **ICP Motoko**                     |
| Languages              | **TypeScript, JavaScript, Motoko** |
| Communication          | REST APIs / Canister Calls         |
| Task Scheduling        | Cron Jobs / Background Workers     |

---

## 🌍 Architecture Overview

```
FrontEnd (beatswap.io)
         │
         ▼
 oracle-core ──► Partner APIs
         │
         ▼
   ICP Canisters (Motoko)
```

---

## 📡 API Consumers

* **BeatSwap Frontend** – Token utilities and market services
* **Partner Platforms** – Secure oracle data and ICP integrations
* **External Integrations** – Service communication via REST APIs

---


## 📡 CANISTER Info

| CANISTER NAME       | CANISTER ID                        |
| --------------------| ---------------------------------- |
| ORACLE_CANISTER     | cl3mf-syaaa-aaaab-qb5pa-cai        |
| UNLOCK_CANISTER     | h6d54-pyaaa-aaaab-qb5ra-cai        |
| PLAY_CANISTER       | hqbqu-uiaaa-aaaab-qb5qa-cai        |
| MEMBER_CANISTER     | cfzbn-jiaaa-aaaab-qb5oa-cai        |
| MEMBERSNAP_CANISTER | ccyhz-eqaaa-aaaab-qb5oq-cai        |
| HOLDER_CANISTER     | cq6qa-iaaaa-aaaab-qb5nq-cai        |
| TOKEN_CANISTER      | eb7hz-ryaaa-aaaae-ab2iq-cai        |
| TOKEN_ARC1_CANISTER | dwj33-qiaaa-aaaae-ab5ga-cai        |
| TOKEN_ARC2_CANISTER | 7tdkf-iaaaa-aaaae-ac3ya-cai        |
| TOKEN_ARC3_CANISTER | wg43r-zyaaa-aaaae-aggya-cai        |

---

## 🤝 Contributions

Contributions are welcome! Please submit a pull request or open an issue for feature suggestions or bug reports.

---
