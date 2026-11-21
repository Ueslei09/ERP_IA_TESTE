<!-- src/modules/customers/components/CustomerRegistrationPanel.vue -->
<template>
  <section class="erp-light-module py-4 py-md-5 min-vh-100">
    <div class="container-fluid px-3 px-lg-4">
      <!-- Cabeçalho -->
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">
        <div>
          <span class="badge bg-white border border-black text-black mb-2">
            <i class="bi bi-shield-check me-1" aria-hidden="true"></i>
            Módulo Fiscal & Comercial • Origem Emissor: {{ fiscalEvaluation.originUf }}
          </span>
          <h1 class="h4 fw-bold text-black mb-1">
            <i class="bi bi-person-vcard me-2 text-black" aria-hidden="true"></i>
            Cadastro de Clientes
          </h1>
          <p class="text-black small mb-0">
            Endereço fiscal estruturado para cálculo de ICMS, DIFAL, SUFRAMA e emissão de NF-e.
          </p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline-dark btn-sm erp-hover-btn" @click="goToHome">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Voltar ao Home
          </button>
          <button type="button" class="btn btn-outline-dark btn-sm erp-hover-btn" @click="resetCustomerForm">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Novo Cliente
          </button>
          <button
            type="button"
            class="btn btn-dark text-white fw-semibold btn-sm erp-hover-btn"
            :disabled="isSubmitting"
            @click="submitCustomer"
          >
            <i class="bi bi-check2-circle me-1" aria-hidden="true"></i>
            {{ isSubmitting ? "Salvando..." : "Salvar Cliente" }}
          </button>
        </div>
      </div>

      <!-- Alertas de feedback -->
      <div
        v-if="feedback.message"
        :class="['alert', `alert-${feedback.type || 'info'}`, 'text-black d-flex align-items-center gap-2 py-2 small']"
        role="alert"
      >
        <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
        <span>{{ feedback.message }}</span>
      </div>

      <!-- Banner explícito da Regra Fiscal (UF do Destinatário + DIFAL + SUFRAMA) -->
      <div class="erp-card rounded-3 p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-lg-8">
            <div class="d-flex align-items-center gap-2 text-black fw-semibold small mb-1">
              <i class="bi bi-diagram-3 text-black" aria-hidden="true"></i>
              <span>Motor Fiscal — Regra de UF do Destinatário & DIFAL</span>
            </div>
            <p class="text-black small mb-0">{{ fiscalEvaluation.taxSummary }}</p>
          </div>
          <div class="col-12 col-lg-4 d-flex flex-wrap gap-2 justify-content-lg-end">
            <span
              class="badge px-2 py-2"
              :class="fiscalEvaluation.difalApplies ? 'bg-warning text-black border border-black' : 'bg-white border border-black text-black'"
            >
              <i class="bi bi-calculator me-1" aria-hidden="true"></i>
              DIFAL: {{ fiscalEvaluation.difalApplies ? "APLICÁVEL" : "NÃO SE APLICA" }}
            </span>
            <span
              class="badge px-2 py-2"
              :class="fiscalEvaluation.suframaApplies ? 'bg-info text-black border border-black' : 'bg-white border border-black text-black'"
            >
              <i class="bi bi-geo-alt me-1" aria-hidden="true"></i>
              SUFRAMA: {{ fiscalEvaluation.suframaApplies ? "ATIVO" : "PADRÃO" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Navegação de Abas -->
      <ul class="nav nav-pills erp-tabs gap-2 mb-4 flex-wrap">
        <li class="nav-item">
          <button
            type="button"
            class="nav-link erp-tab-btn"
            :class="{ active: activeTab === 'cadastro' }"
            @click="activeTab = 'cadastro'"
          >
            <i class="bi bi-person-lines-fill me-1" aria-hidden="true"></i>
            Dados & Endereço Fiscal
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link erp-tab-btn"
            :class="{ active: activeTab === 'financeiro' }"
            @click="activeTab = 'financeiro'"
          >
            <i class="bi bi-wallet2 me-1" aria-hidden="true"></i>
            Informações Financeiras
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link erp-tab-btn"
            :class="{ active: activeTab === 'uf' }"
            @click="activeTab = 'uf'"
          >
            <i class="bi bi-map me-1" aria-hidden="true"></i>
            Manutenção UF
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link erp-tab-btn"
            :class="{ active: activeTab === 'cep' }"
            @click="activeTab = 'cep'"
          >
            <i class="bi bi-mailbox me-1" aria-hidden="true"></i>
            Manutenção CEP
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link erp-tab-btn"
            :class="{ active: activeTab === 'bairros' }"
            @click="activeTab = 'bairros'"
          >
            <i class="bi bi-signpost-2 me-1" aria-hidden="true"></i>
            Manutenção Bairros
          </button>
        </li>
      </ul>

      <!-- ABA 1: DADOS PRINCIPAIS E ENDEREÇO FISCAL -->
      <div v-if="activeTab === 'cadastro'" class="erp-card rounded-3 p-3 p-md-4 mb-4">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-card-checklist me-2 text-black" aria-hidden="true"></i>
          Dados Cadastrais & Identificação Fiscal
        </h2>

        <div class="row g-3 mb-4">
          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">CPF / CNPJ *</label>
            <div class="input-group">
              <span class="input-group-text erp-input-addon"><i class="bi bi-upc" aria-hidden="true"></i></span>
              <input
                v-model="form.document"
                type="text"
                class="form-control erp-input"
                :class="{ 'is-invalid': errors.document }"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
              />
            </div>
            <div v-if="errors.document" class="text-danger small mt-1">{{ errors.document }}</div>
          </div>

          <div class="col-12 col-md-8">
            <label class="form-label text-black small fw-semibold">Nome Completo / Razão Social *</label>
            <input
              v-model="form.fullName"
              type="text"
              class="form-control erp-input"
              :class="{ 'is-invalid': errors.fullName }"
              placeholder="Nome do cliente ou razão social"
            />
            <div v-if="errors.fullName" class="text-danger small mt-1">{{ errors.fullName }}</div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label text-black small fw-semibold">Telefone *</label>
            <div class="input-group">
              <span class="input-group-text erp-input-addon"><i class="bi bi-telephone" aria-hidden="true"></i></span>
              <input
                v-model="form.phone"
                type="text"
                class="form-control erp-input"
                :class="{ 'is-invalid': errors.phone }"
                placeholder="(62) 99999-9999"
              />
            </div>
            <div v-if="errors.phone" class="text-danger small mt-1">{{ errors.phone }}</div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label text-black small fw-semibold">E-mail *</label>
            <div class="input-group">
              <span class="input-group-text erp-input-addon"><i class="bi bi-envelope" aria-hidden="true"></i></span>
              <input
                v-model="form.email"
                type="email"
                class="form-control erp-input"
                :class="{ 'is-invalid': errors.email }"
                placeholder="financeiro@empresa.com.br"
              />
            </div>
            <div v-if="errors.email" class="text-danger small mt-1">{{ errors.email }}</div>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">Inscrição Estadual *</label>
            <input
              v-model="form.stateRegistration"
              type="text"
              class="form-control erp-input"
              :class="{ 'is-invalid': errors.stateRegistration }"
              placeholder="Número da IE ou ISENTO"
            />
            <div v-if="errors.stateRegistration" class="text-danger small mt-1">{{ errors.stateRegistration }}</div>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">Inscrição Municipal</label>
            <input
              v-model="form.municipalRegistration"
              type="text"
              class="form-control erp-input"
              placeholder="Inscrição Municipal (ISS / serviços)"
            />
          </div>

          <div class="col-12 col-md-4 d-flex align-items-end">
            <div class="form-check form-switch erp-switch-box w-100 rounded p-2 ps-5">
              <input
                id="suframaSwitch"
                v-model="form.suframaOptant"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label text-black small fw-semibold" for="suframaSwitch">
                Optante pela SUFRAMA
              </label>
            </div>
          </div>

          <div v-if="form.suframaOptant" class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">Inscrição SUFRAMA</label>
            <input
              v-model="form.suframaCode"
              type="text"
              class="form-control erp-input"
              placeholder="Código SUFRAMA para NF-e"
            />
          </div>
        </div>

        <hr class="border-black opacity-25 my-4" />

        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-geo-alt-fill me-2 text-black" aria-hidden="true"></i>
          Endereço Fiscal (Base para ICMS, DIFAL e Emissão de Notas)
        </h2>

        <div class="row g-3">
          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label text-black small fw-semibold">CEP *</label>
            <input
              v-model="form.fiscalAddress.cep"
              list="ceps-datalist"
              type="text"
              class="form-control erp-input"
              :class="{ 'is-invalid': errors.cep }"
              placeholder="00000-000"
            />
            <datalist id="ceps-datalist">
              <option v-for="item in filteredCeps" :key="item.id" :value="item.cep">
                {{ item.street }} - {{ item.district }} ({{ item.uf }})
              </option>
            </datalist>
            <div v-if="errors.cep" class="text-danger small mt-1">{{ errors.cep }}</div>
          </div>

          <div class="col-12 col-sm-6 col-md-2">
            <label class="form-label text-black small fw-semibold">UF Destinatário *</label>
            <select
              v-model="form.fiscalAddress.uf"
              class="form-select erp-input"
              :class="{ 'is-invalid': errors.uf }"
            >
              <option value="">Selecione</option>
              <option v-for="ufItem in ufs" :key="ufItem.code" :value="ufItem.code">
                {{ ufItem.code }} - {{ ufItem.name }}
              </option>
            </select>
            <div v-if="errors.uf" class="text-danger small mt-1">{{ errors.uf }}</div>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">Logradouro *</label>
            <input
              v-model="form.fiscalAddress.street"
              type="text"
              class="form-control erp-input"
              :class="{ 'is-invalid': errors.street }"
              placeholder="Rua, Avenida, Rodovia..."
            />
            <div v-if="errors.street" class="text-danger small mt-1">{{ errors.street }}</div>
          </div>

          <div class="col-12 col-md-3">
            <label class="form-label text-black small fw-semibold">Bairro *</label>
            <select
              v-model="form.fiscalAddress.district"
              class="form-select erp-input"
              :class="{ 'is-invalid': errors.district }"
            >
              <option value="">Selecione o bairro</option>
              <option v-for="b in filteredDistricts" :key="b.id" :value="b.name">
                {{ b.name }} ({{ b.uf }})
              </option>
            </select>
            <div v-if="errors.district" class="text-danger small mt-1">{{ errors.district }}</div>
          </div>

          <div class="col-12 col-md-6">
            <div class="form-check erp-switch-box rounded p-2 ps-4">
              <input
                id="finalConsumerCheck"
                v-model="form.fiscalAddress.isFinalConsumer"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label text-black small" for="finalConsumerCheck">
                Consumidor Final (considerado no cálculo de DIFAL interestadual)
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 2: INFORMAÇÕES FINANCEIRAS -->
      <div v-else-if="activeTab === 'financeiro'" class="erp-card rounded-3 p-3 p-md-4 mb-4">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-cash-coin me-2 text-black" aria-hidden="true"></i>
          Informações Financeiras & Controle de Crédito
        </h2>

        <div
          v-if="commercialRestrictionActive"
          class="alert alert-warning text-black d-flex align-items-center gap-2 py-2 small mb-3"
          role="alert"
        >
          <i class="bi bi-lock-fill" aria-hidden="true"></i>
          <span>
            <strong>Crédito Concedido ativo:</strong> comercial liberado <strong>somente</strong> para movimentação bancária ou baixa de títulos.
          </span>
        </div>

        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">Tipo de Cliente</label>
            <select v-model="form.financial.customerType" class="form-select erp-input">
              <option v-for="t in customerTypes" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">Prazo Máximo de Dias (A Prazo)</label>
            <input
              v-model.number="form.financial.maxTermDays"
              type="number"
              min="0"
              class="form-control erp-input"
              :class="{ 'is-invalid': errors.maxTermDays }"
            />
            <div v-if="errors.maxTermDays" class="text-danger small mt-1">{{ errors.maxTermDays }}</div>
          </div>

          <div class="col-12 col-md-4">
            <label class="form-label text-black small fw-semibold">Banco de Relacionamento</label>
            <select v-model="form.financial.relationshipBankCode" class="form-select erp-input">
              <option v-for="bank in relationshipBanks" :key="bank.code" :value="bank.code">
                {{ bank.code }} - {{ bank.name }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label text-black small fw-semibold">Limite Máximo de Crédito (R$)</label>
            <input
              v-model.number="form.financial.creditLimit"
              type="number"
              step="0.01"
              min="0"
              class="form-control erp-input"
              :class="{ 'is-invalid': errors.creditLimit }"
            />
            <div v-if="errors.creditLimit" class="text-danger small mt-1">{{ errors.creditLimit }}</div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label text-black small fw-semibold">Valor do Saldo (R$)</label>
            <input
              v-model.number="form.financial.balanceAmount"
              type="number"
              step="0.01"
              class="form-control erp-input"
            />
          </div>

          <div class="col-12">
            <label class="form-label text-black small fw-semibold d-block">Tipos de Pagamento Aceitos</label>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                type="button"
                class="btn btn-sm erp-hover-btn"
                :class="
                  form.financial.acceptedPaymentMethods.includes(method.value)
                    ? 'btn-dark text-white fw-semibold'
                    : 'btn-outline-dark text-black'
                "
                @click="togglePaymentMethod(method.value)"
              >
                <i class="bi bi-check2 me-1" aria-hidden="true"></i>
                {{ method.label }}
              </button>
            </div>
          </div>

          <div class="col-12">
            <div class="form-check form-switch erp-switch-box rounded p-2 ps-5">
              <input
                id="creditGrantedSwitch"
                v-model="form.financial.creditGranted"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label text-black small fw-semibold" for="creditGrantedSwitch">
                Crédito Concedido ao Cliente (restringe comercial a movimentação bancária ou baixa de títulos)
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- ABA 3: MANUTENÇÃO UF -->
      <div v-else-if="activeTab === 'uf'" class="erp-card rounded-3 p-3 p-md-4 mb-4">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-map me-2 text-black" aria-hidden="true"></i>
          Tabela Auxiliar — Manutenção de UF
        </h2>

        <form class="row g-2 mb-4" @submit.prevent="addUf">
          <div class="col-6 col-md-2">
            <input
              v-model="newUf.code"
              type="text"
              maxlength="2"
              class="form-control erp-input text-uppercase"
              placeholder="UF (ex: SP)"
            />
          </div>
          <div class="col-6 col-md-4">
            <input
              v-model="newUf.name"
              type="text"
              class="form-control erp-input"
              placeholder="Nome do Estado"
            />
          </div>
          <div class="col-6 col-md-2">
            <input
              v-model.number="newUf.icmsIntrastateRate"
              type="number"
              step="0.5"
              class="form-control erp-input"
              placeholder="ICMS %"
            />
          </div>
          <div class="col-6 col-md-2 d-flex align-items-center">
            <div class="form-check">
              <input id="newUfSuframa" v-model="newUf.suframaRegion" type="checkbox" class="form-check-input" />
              <label for="newUfSuframa" class="form-check-label text-black small">SUFRAMA</label>
            </div>
          </div>
          <div class="col-12 col-md-2">
            <button type="submit" class="btn btn-dark text-white fw-semibold w-100 erp-hover-btn">
              Adicionar UF
            </button>
          </div>
        </form>

        <div class="table-responsive">
          <table class="table table-light table-hover align-middle mb-0 small text-black">
            <thead>
              <tr>
                <th>UF</th>
                <th>Estado</th>
                <th>ICMS Interno (%)</th>
                <th>SUFRAMA</th>
                <th class="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ufs" :key="item.code">
                <td class="fw-bold">{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.icmsIntrastateRate }}%</td>
                <td>{{ item.suframaRegion ? "Sim" : "Não" }}</td>
                <td class="text-end">
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="removeUf(item.code)"
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ABA 4: MANUTENÇÃO CEP -->
      <div v-else-if="activeTab === 'cep'" class="erp-card rounded-3 p-3 p-md-4 mb-4">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-mailbox me-2 text-black" aria-hidden="true"></i>
          Tabela Auxiliar — Manutenção de CEP
        </h2>

        <form class="row g-2 mb-4" @submit.prevent="addCep">
          <div class="col-12 col-sm-4 col-md-2">
            <input
              v-model="newCep.cep"
              type="text"
              class="form-control erp-input"
              placeholder="00000-000"
            />
          </div>
          <div class="col-12 col-sm-8 col-md-4">
            <input
              v-model="newCep.street"
              type="text"
              class="form-control erp-input"
              placeholder="Logradouro"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <input
              v-model="newCep.district"
              type="text"
              class="form-control erp-input"
              placeholder="Bairro"
            />
          </div>
          <div class="col-6 col-sm-3 col-md-1">
            <select v-model="newCep.uf" class="form-select erp-input">
              <option v-for="u in ufs" :key="u.code" :value="u.code">{{ u.code }}</option>
            </select>
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <button type="submit" class="btn btn-dark text-white fw-semibold w-100 erp-hover-btn">
              Salvar CEP
            </button>
          </div>
        </form>

        <div class="table-responsive">
          <table class="table table-light table-hover align-middle mb-0 small text-black">
            <thead>
              <tr>
                <th>CEP</th>
                <th>Logradouro</th>
                <th>Bairro</th>
                <th>UF</th>
                <th class="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in ceps" :key="entry.id">
                <td class="fw-bold">{{ entry.cep }}</td>
                <td>{{ entry.street }}</td>
                <td>{{ entry.district }}</td>
                <td>{{ entry.uf }}</td>
                <td class="text-end">
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="removeCep(entry.id)"
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ABA 5: MANUTENÇÃO BAIRROS -->
      <div v-else-if="activeTab === 'bairros'" class="erp-card rounded-3 p-3 p-md-4 mb-4">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-signpost-2 me-2 text-black" aria-hidden="true"></i>
          Tabela Auxiliar — Manutenção de Bairros
        </h2>

        <form class="row g-2 mb-4" @submit.prevent="addDistrict">
          <div class="col-12 col-md-6">
            <input
              v-model="newDistrict.name"
              type="text"
              class="form-control erp-input"
              placeholder="Nome do bairro"
            />
          </div>
          <div class="col-6 col-md-3">
            <select v-model="newDistrict.uf" class="form-select erp-input">
              <option v-for="u in ufs" :key="u.code" :value="u.code">
                {{ u.code }} - {{ u.name }}
              </option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <button type="submit" class="btn btn-dark text-white fw-semibold w-100 erp-hover-btn">
              Adicionar Bairro
            </button>
          </div>
        </form>

        <div class="table-responsive">
          <table class="table table-light table-hover align-middle mb-0 small text-black">
            <thead>
              <tr>
                <th>Bairro</th>
                <th>UF</th>
                <th class="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in districts" :key="b.id">
                <td>{{ b.name }}</td>
                <td>{{ b.uf }}</td>
                <td class="text-end">
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="removeDistrict(b.id)"
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lista rápida de clientes cadastrados / em edição -->
      <div class="erp-card rounded-3 p-3 p-md-4">
        <h2 class="h6 fw-bold text-black mb-3">
          <i class="bi bi-people me-2 text-black" aria-hidden="true"></i>
          Clientes Cadastrados ({{ customers.length }})
        </h2>

        <div v-if="customers.length === 0" class="text-black small">
          Nenhum cliente listado no momento. Preencha o formulário acima e clique em "Salvar Cliente".
        </div>

        <div v-else class="table-responsive">
          <table class="table table-light table-hover align-middle mb-0 small text-black">
            <thead>
              <tr>
                <th>CPF/CNPJ</th>
                <th>Nome</th>
                <th>UF / CEP</th>
                <th>Tipo</th>
                <th>Crédito</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in customers" :key="item.id">
                <td>{{ item.document }}</td>
                <td class="fw-semibold">{{ item.fullName }}</td>
                <td>{{ item.fiscalAddress?.uf }} • {{ item.fiscalAddress?.cep }}</td>
                <td class="text-capitalize">{{ item.financial?.customerType }}</td>
                <td>
                  <span
                    class="badge"
                    :class="item.financial?.creditGranted ? 'bg-warning text-black' : 'bg-dark text-white'"
                  >
                    {{ item.financial?.creditGranted ? "Restrito (Banco/Títulos)" : "Normal" }}
                  </span>
                </td>
                <td class="text-end">
                  <button
                    type="button"
                    class="btn btn-outline-dark btn-sm me-1"
                    @click="editCustomer(item)"
                  >
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="removeCustomer(item.id)"
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCustomerRegistration } from "../composables/useCadastroDeClientes.js";

const router = useRouter();

const {
  activeTab,
  form,
  customers,
  errors,
  feedback,
  isSubmitting,
  ufs,
  ceps,
  districts,
  filteredDistricts,
  filteredCeps,
  newUf,
  newCep,
  newDistrict,
  fiscalEvaluation,
  commercialRestrictionActive,
  relationshipBanks,
  customerTypes,
  paymentMethods,
  togglePaymentMethod,
  loadCustomers,
  submitCustomer,
  resetCustomerForm,
  editCustomer,
  removeCustomer,
  addUf,
  removeUf,
  addCep,
  removeCep,
  addDistrict,
  removeDistrict,
} = useCustomerRegistration();

function goToHome() {
  router.push("/home");
}

onMounted(loadCustomers);
</script>

<style scoped>
.erp-light-module,
.erp-light-module * {
  color: #000000;
}

.erp-light-module {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.erp-card {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid rgba(0, 0, 0, 0.16);
  transition: border-color 0.2s ease;
}

.erp-card:hover {
  border-color: #000000;
}

.erp-input,
.erp-input-addon {
  background-color: #ffffff !important;
  color: #000000 !important;
  border-color: rgba(0, 0, 0, 0.28);
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.erp-input:hover,
.erp-input:focus {
  background-color: #f8f9fa !important;
  color: #000000 !important;
  border-color: #000000;
  box-shadow: 0 0 0 0.15rem rgba(0, 0, 0, 0.12);
}

.erp-input::placeholder {
  color: rgba(0, 0, 0, 0.5) !important;
}

.erp-switch-box {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid rgba(0, 0, 0, 0.22);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.erp-switch-box:hover {
  border-color: #000000;
  background-color: #f8f9fa !important;
}

.erp-tab-btn {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid rgba(0, 0, 0, 0.22);
  transition: all 0.2s ease;
}

.erp-tab-btn:hover {
  background-color: #f1f3f5 !important;
  color: #000000 !important;
  border-color: #000000;
}

.erp-tab-btn.active {
  background-color: #000000 !important;
  color: #ffffff !important;
  border-color: #000000;
  font-weight: 600;
}

.erp-tab-btn.active i {
  color: #ffffff !important;
}

.btn-dark,
.btn-dark * {
  color: #ffffff !important;
}

.erp-hover-btn {
  transition: transform 0.15s ease, filter 0.15s ease;
}

.erp-hover-btn:hover {
  transform: translateY(-1px);
  filter: brightness(0.96);
}
</style>