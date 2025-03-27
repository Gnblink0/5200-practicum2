const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: String,
        type: {
            type: String,
            enum: ['private', 'public', 'employer', 'other'],
            required: true
        }
    },
    policy: {
        number: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['individual', 'family', 'group', 'medicare', 'medicaid'],
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled', 'pending'],
            default: 'active'
        }
    },
    coverage: {
        deductible: {
            type: Number,
            required: true,
            min: 0
        },
        copay: {
            type: Number,
            required: true,
            min: 0
        },
        coinsurance: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        outOfPocketMax: {
            type: Number,
            required: true,
            min: 0
        },
        services: [{
            name: String,
            covered: Boolean,
            limit: Number,
            notes: String
        }]
    },
    subscriber: {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        relationship: {
            type: String,
            enum: ['self', 'spouse', 'child', 'parent', 'other'],
            required: true
        },
        ssn: String
    },
    dependents: [{
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        relationship: {
            type: String,
            enum: ['spouse', 'child', 'parent', 'other'],
            required: true
        },
        ssn: String
    }],
    claims: [{
        claimNumber: String,
        dateOfService: Date,
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'submitted', 'approved', 'rejected', 'paid'],
            default: 'pending'
        },
        details: {
            type: mongoose.Schema.Types.Mixed
        },
        documents: [{
            filename: String,
            path: String,
            type: String,
            uploadDate: Date
        }]
    }],
    preAuthorizations: [{
        service: String,
        requestDate: Date,
        approvalDate: Date,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'expired'],
            default: 'pending'
        },
        referenceNumber: String,
        notes: String
    }],
    contact: {
        phone: String,
        email: String,
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },
    metadata: {
        lastVerified: Date,
        verificationMethod: String,
        notes: String,
        tags: [String]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
insuranceSchema.index({ patientId: 1, 'policy.status': 1 });
insuranceSchema.index({ 'policy.number': 1 });
insuranceSchema.index({ 'claims.claimNumber': 1 });
insuranceSchema.index({ 'preAuthorizations.referenceNumber': 1 });

// Pre-save middleware to update lastUpdatedBy
insuranceSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastUpdatedBy = this._doc.lastUpdatedBy;
    }
    next();
});

// Method to add claim
insuranceSchema.methods.addClaim = async function(claimData) {
    this.claims.push({
        ...claimData,
        status: 'pending'
    });
    await this.save();
};

// Method to update claim status
insuranceSchema.methods.updateClaimStatus = async function(claimNumber, status) {
    const claim = this.claims.find(c => c.claimNumber === claimNumber);
    if (!claim) {
        throw new Error('Claim not found');
    }
    claim.status = status;
    await this.save();
};

// Method to add pre-authorization
insuranceSchema.methods.addPreAuthorization = async function(preAuthData) {
    this.preAuthorizations.push({
        ...preAuthData,
        status: 'pending'
    });
    await this.save();
};

// Method to update pre-authorization status
insuranceSchema.methods.updatePreAuthorizationStatus = async function(referenceNumber, status) {
    const preAuth = this.preAuthorizations.find(p => p.referenceNumber === referenceNumber);
    if (!preAuth) {
        throw new Error('Pre-authorization not found');
    }
    preAuth.status = status;
    if (status === 'approved') {
        preAuth.approvalDate = new Date();
    }
    await this.save();
};

// Method to add dependent
insuranceSchema.methods.addDependent = async function(dependentData) {
    this.dependents.push(dependentData);
    await this.save();
};

// Method to remove dependent
insuranceSchema.methods.removeDependent = async function(ssn) {
    this.dependents = this.dependents.filter(d => d.ssn !== ssn);
    await this.save();
};

// Method to check coverage for service
insuranceSchema.methods.checkCoverage = function(serviceName) {
    const service = this.coverage.services.find(s => s.name === serviceName);
    return service ? {
        covered: service.covered,
        limit: service.limit,
        notes: service.notes
    } : null;
};

// Method to calculate patient responsibility
insuranceSchema.methods.calculatePatientResponsibility = function(amount) {
    if (amount <= this.coverage.deductible) {
        return amount;
    }
    const afterDeductible = amount - this.coverage.deductible;
    const coinsuranceAmount = afterDeductible * (this.coverage.coinsurance / 100);
    return this.coverage.deductible + coinsuranceAmount;
};

// Method to get active claims
insuranceSchema.methods.getActiveClaims = function() {
    return this.claims.filter(claim => 
        claim.status === 'pending' || claim.status === 'submitted'
    );
};

// Method to get claim history
insuranceSchema.methods.getClaimHistory = function() {
    return this.claims.sort((a, b) => b.dateOfService - a.dateOfService);
};

// Method to get pre-authorization history
insuranceSchema.methods.getPreAuthorizationHistory = function() {
    return this.preAuthorizations.sort((a, b) => b.requestDate - a.requestDate);
};

// Method to verify insurance
insuranceSchema.methods.verifyInsurance = async function() {
    this.metadata.lastVerified = new Date();
    this.metadata.verificationMethod = 'system';
    await this.save();
};

const Insurance = mongoose.model('Insurance', insuranceSchema);

module.exports = Insurance; 