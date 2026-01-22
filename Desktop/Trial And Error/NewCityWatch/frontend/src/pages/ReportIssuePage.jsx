import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, FileText, Camera, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { issuesService } from '../services/issues.service';
import LocationPicker from '../components/common/LocationPicker';
import FileUploader from '../components/common/FileUploader';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { Card } from '../components/common/Card';
import './ReportIssuePage.css';

const STEPS = [
  { number: 1, title: 'Location', icon: MapPin },
  { number: 2, title: 'Details', icon: FileText },
  { number: 3, title: 'Evidence', icon: Camera },
  { number: 4, title: 'Review', icon: CheckCircle },
];

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    location: null, // { lat, lng }
    address: '', // Optional manual address
    cityId: '', // Selected city ID
    wardId: '', // Will be auto-selected based on geo-fencing (TODO) or manual in MVP
    categoryId: '',
    title: '',
    description: '',
    expectedOutcome: '',
    evidence: [], // [{ url, ... }]
  });

  // Fetch initial config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [catsRes, citiesRes] = await Promise.all([
          issuesService.getCategories(),
          issuesService.getCities()
        ]);
        
        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (citiesRes.data.success) {
            setCities(citiesRes.data.data);
            // Auto-select first active city for MVP (Nagpur)
            if (citiesRes.data.data.length > 0) {
              setFormData(prev => ({ ...prev, cityId: citiesRes.data.data[0].id }));
            }
        }
      } catch (error) {
        toast.error('Failed to load system configuration');
        console.error(error);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // Handlers
  const handleLocationSelect = (latlng) => {
    setFormData(prev => ({ ...prev, location: latlng }));
  };

  const handleEvidenceUpload = (files) => {
    setFormData(prev => ({ ...prev, evidence: files }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.location) {
          toast.error('Please select a location on the map');
          return false;
        }
        return true;
      case 2:
        if (!formData.title.trim()) {
           toast.error('Title is required');
           return false;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return false;
         }
        if (!formData.categoryId) {
            toast.error('Please select a category');
            return false;
        }
        return true;
      case 3:
        if (formData.evidence.length === 0) {
            toast.error('Please upload at least one photo or video as evidence');
            return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Mock ward selection: Use first ward of the city if available, or fetch
      // For MVP, we'll fetch wards for the city and pick one? 
      // Ideally backend geomatching. 
      // For now let's just use the first ward if we can't detect it, or handle it in backend if nullable.
      // But wardId is nullable in backend schema. Okay.
      
      let payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        cityId: formData.cityId,
        latitude: formData.location.lat,
        longitude: formData.location.lng,
        address: formData.address,
        expectedOutcome: formData.expectedOutcome,
        evidence: formData.evidence,
        // wardId: ... ? 
      };

      await issuesService.createIssue(payload);
      toast.success('Issue reported successfully!');
      navigate('/citizen'); // Redirect to dashboard
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingConfig) {
    return <div className="page-loading"><Spinner size="large" /></div>;
  }

  // Render Steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">Where is the issue?</h2>
            <p className="step-description">Pinpoint the exact location on the map</p>
            <LocationPicker 
                onLocationSelect={handleLocationSelect} 
                initialLocation={formData.location}
            />
            <Input 
                label="Landmark / Address (Optional)"
                placeholder="e.g., Near State Bank, Opposite Gandhi statue"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
        );
      case 2:
        return (
          <div className="step-content">
             <h2 className="step-title">What is the problem?</h2>
             <p className="step-description">Provide details so we can direct it to the right department</p>
             
             <div className="form-group">
                <label>Category</label>
                <div className="category-grid">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`category-card ${formData.categoryId === cat.id ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, categoryId: cat.id }))}
                        >
                            <span className="cat-name">{cat.name}</span>
                        </button>
                    ))}
                </div>
             </div>

             <Input 
                label="Issue Title"
                placeholder="Brief summary (e.g., Large pothole causing traffic)"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
             />
             
             <div className="form-group">
                <label>Description</label>
                <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Describe the issue in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                ></textarea>
             </div>

             <Input 
                label="Expected Outcome (Optional)"
                placeholder="What action do you want taken?"
                value={formData.expectedOutcome}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedOutcome: e.target.value }))}
             />
          </div>
        );
      case 3:
        return (
            <div className="step-content">
                <h2 className="step-title">Add Evidence</h2>
                <p className="step-description">Upload photos or videos to verify the issue (Max 3)</p>
                <div className="evidence-alert">
                    <Info size={20} />
                    <p>Issues with clear photo evidence are 3x more likely to be resolved.</p>
                </div>
                <FileUploader 
                    onUploadComplete={handleEvidenceUpload}
                    existingFiles={formData.evidence}
                    maxFiles={3}
                />
            </div>
        );
      case 4:
         const categoryName = categories.find(c => c.id === formData.categoryId)?.name;
         return (
             <div className="step-content">
                 <h2 className="step-title">Review & Submit</h2>
                 <p className="step-description">Please verify details before submitting</p>
                 
                 <Card className="review-card">
                    <div className="review-section">
                        <h4>Location</h4>
                        <div className="review-row">
                            <MapPin size={16} />
                            <span>{formData.location?.lat.toFixed(6)}, {formData.location?.lng.toFixed(6)}</span>
                        </div>
                        {formData.address && <p className="review-subtext">{formData.address}</p>}
                    </div>
                    
                    <div className="review-divider"></div>

                    <div className="review-section">
                        <h4>Details</h4>
                        <p><strong>Category:</strong> {categoryName}</p>
                        <p><strong>Title:</strong> {formData.title}</p>
                        <p><strong>Description:</strong> {formData.description}</p>
                    </div>

                    <div className="review-divider"></div>

                    <div className="review-section">
                        <h4>Evidence</h4>
                        <p>{formData.evidence.length} file(s) attached</p>
                        <div className="review-thumbs">
                             {formData.evidence.map((f, i) => (
                                 f.mimetype.startsWith('image') && 
                                 <img key={i} src={`http://localhost:5000${f.url}`} alt="thumb" className="review-thumb" />
                             ))}
                        </div>
                    </div>
                 </Card>
             </div>
         );
      default: return null;
    }
  };

  return (
    <div className="report-page">
      <div className="report-container">
        {/* Progress Stepper */}
        <div className="stepper">
            {STEPS.map((step, idx) => (
                <div key={step.number} className={`step-item ${currentStep >= step.number ? 'active' : ''}`}>
                    <div className="step-icon">
                        {currentStep > step.number ? <CheckCircle size={20} /> : <step.icon size={20} />}
                    </div>
                    <span className="step-label">{step.title}</span>
                    {idx < STEPS.length - 1 && <div className="step-line"></div>}
                </div>
            ))}
        </div>

        {/* Content Area */}
        <div className="step-container">
            {renderStep()}
        </div>

        {/* Footer Actions */}
        <div className="form-actions">
            <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1 || submitting}
            >
                <ChevronLeft size={18} /> Back
            </Button>
            
            {currentStep < 4 ? (
                <Button onClick={handleNext}>
                    Next <ChevronRight size={18} />
                </Button>
            ) : (
                <Button 
                    onClick={handleSubmit} 
                    disabled={submitting} 
                    isLoading={submitting}
                    className="submit-btn"
                >
                    Submit Report
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;
