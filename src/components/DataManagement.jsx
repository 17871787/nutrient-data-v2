import React, { useState } from 'react';
import { Download, Upload, Save, X, Plus, Trash2, Edit2, FileJson, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { KOU_TYPES, PATHWAY_TYPES, createKOU, createPathway } from '../data/kouStructure';

const DataManagement = ({ kous, pathways, onUpdateKous, onUpdatePathways, onClose }) => {
  const [activeTab, setActiveTab] = useState('kous');
  const [editingItem, setEditingItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [newItemType, setNewItemType] = useState('');

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Input field component
  const InputField = ({ label, value, onChange, type = 'number', unit, min, max, step = 1 }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min={min}
          max={max}
          step={step}
        />
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );

  // KOU Editor
  const KOUEditor = ({ kou, onSave, onCancel }) => {
    const [editedKOU, setEditedKOU] = useState(kou || {
      id: '',
      type: KOU_TYPES.FIELD,
      name: '',
      properties: {}
    });

    const updateProperty = (path, value) => {
      setEditedKOU(prev => {
        const updated = { ...prev };
        const keys = path.split('.');
        let obj = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!obj[keys[i]]) obj[keys[i]] = {};
          obj = obj[keys[i]];
        }
        
        obj[keys[keys.length - 1]] = value;
        return updated;
      });
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="ID"
            value={editedKOU.id}
            onChange={(v) => updateProperty('id', v)}
            type="text"
          />
          <InputField
            label="Name"
            value={editedKOU.name}
            onChange={(v) => updateProperty('name', v)}
            type="text"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={editedKOU.type}
              onChange={(e) => updateProperty('type', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(KOU_TYPES).map(([key, value]) => (
                <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Type-specific properties */}
          {editedKOU.type === KOU_TYPES.FIELD && (
            <>
              <InputField
                label="Area"
                value={editedKOU.properties?.area}
                onChange={(v) => updateProperty('properties.area', v)}
                unit="ha"
                min={0}
                step={0.1}
              />
              <InputField
                label="Soil Type"
                value={editedKOU.properties?.soilType}
                onChange={(v) => updateProperty('properties.soilType', v)}
                type="text"
              />
            </>
          )}

          {editedKOU.type === KOU_TYPES.LIVESTOCK_GROUP && (
            <>
              <InputField
                label="Animal Count"
                value={editedKOU.properties?.animalCount}
                onChange={(v) => updateProperty('properties.animalCount', v)}
                unit="head"
                min={0}
              />
              <InputField
                label="Average Weight"
                value={editedKOU.properties?.avgWeight}
                onChange={(v) => updateProperty('properties.avgWeight', v)}
                unit="kg"
                min={0}
              />
              <InputField
                label="Milk Yield"
                value={editedKOU.properties?.milkYield}
                onChange={(v) => updateProperty('properties.milkYield', v)}
                unit="L/year"
                min={0}
              />
            </>
          )}

          {(editedKOU.type === KOU_TYPES.FEED_STORE || editedKOU.type === KOU_TYPES.MANURE_STORE) && (
            <>
              <InputField
                label="Capacity"
                value={editedKOU.properties?.capacity}
                onChange={(v) => updateProperty('properties.capacity', v)}
                unit={editedKOU.type === KOU_TYPES.MANURE_STORE ? 'm³' : 'tonnes'}
                min={0}
              />
              <InputField
                label="Current Stock"
                value={editedKOU.properties?.currentStock}
                onChange={(v) => updateProperty('properties.currentStock', v)}
                unit={editedKOU.type === KOU_TYPES.MANURE_STORE ? 'm³' : 'tonnes'}
                min={0}
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedKOU)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save KOU
          </button>
        </div>
      </div>
    );
  };

  // Pathway Editor
  const PathwayEditor = ({ pathway, onSave, onCancel }) => {
    const [editedPathway, setEditedPathway] = useState(pathway || {
      from: '',
      to: '',
      type: PATHWAY_TYPES.FEEDING,
      nutrients: { N: 0, P: 0, K: 0, S: 0 }
    });

    const updateNutrient = (nutrient, value) => {
      setEditedPathway(prev => ({
        ...prev,
        nutrients: {
          ...prev.nutrients,
          [nutrient]: value
        }
      }));
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From KOU</label>
            <select
              value={editedPathway.from}
              onChange={(e) => setEditedPathway(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select KOU...</option>
              {Object.values(kous).map(kou => (
                <option key={kou.id} value={kou.id}>{kou.name} ({kou.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To KOU</label>
            <select
              value={editedPathway.to}
              onChange={(e) => setEditedPathway(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select KOU...</option>
              {Object.values(kous).map(kou => (
                <option key={kou.id} value={kou.id}>{kou.name} ({kou.type})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pathway Type</label>
            <select
              value={editedPathway.type}
              onChange={(e) => setEditedPathway(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(PATHWAY_TYPES).map(([key, value]) => (
                <option key={key} value={value}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-medium text-gray-700 mb-2">Nutrients (kg/year)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(editedPathway.nutrients).map(([nutrient, value]) => (
                <InputField
                  key={nutrient}
                  label={nutrient}
                  value={value}
                  onChange={(v) => updateNutrient(nutrient, v)}
                  min={0}
                  step={0.1}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedPathway)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Pathway
          </button>
        </div>
      </div>
    );
  };

  // Export functions
  const exportAsJSON = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      kous,
      pathways
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrient-budget-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    // KOUs CSV
    const kouHeaders = ['ID', 'Type', 'Name', 'Area (ha)', 'Animal Count', 'Capacity', 'Current Stock'];
    const kouRows = Object.values(kous).map(kou => [
      kou.id,
      kou.type,
      kou.name,
      kou.properties?.area || '',
      kou.properties?.animalCount || '',
      kou.properties?.capacity || '',
      kou.properties?.currentStock || ''
    ]);
    
    const kouCSV = [kouHeaders, ...kouRows].map(row => row.join(',')).join('\n');
    
    // Pathways CSV
    const pathwayHeaders = ['From', 'To', 'Type', 'N (kg)', 'P (kg)', 'K (kg)', 'S (kg)'];
    const pathwayRows = pathways.map(p => [
      p.from,
      p.to,
      p.type,
      p.nutrients.N,
      p.nutrients.P,
      p.nutrients.K,
      p.nutrients.S
    ]);
    
    const pathwayCSV = [pathwayHeaders, ...pathwayRows].map(row => row.join(',')).join('\n');
    
    // Combined CSV
    const combinedCSV = `KOUs\n${kouCSV}\n\nPathways\n${pathwayCSV}`;
    
    const blob = new Blob([combinedCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrient-budget-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import function
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.kous && data.pathways) {
          onUpdateKous(data.kous);
          onUpdatePathways(data.pathways);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error importing file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Add new KOU
  const handleAddKOU = (type) => {
    const newKOU = createKOU(type, `${type}_new_${Date.now()}`, 'New ' + type.replace(/_/g, ' '), {});
    setEditingItem({ type: 'kou', item: newKOU, isNew: true });
  };

  // Add new pathway
  const handleAddPathway = () => {
    const newPathway = createPathway('', '', PATHWAY_TYPES.FEEDING, { N: 0, P: 0, K: 0, S: 0 });
    setEditingItem({ type: 'pathway', item: newPathway, isNew: true });
  };

  // Save KOU
  const handleSaveKOU = (editedKOU) => {
    const updatedKous = { ...kous };
    updatedKous[editedKOU.id] = editedKOU;
    onUpdateKous(updatedKous);
    setEditingItem(null);
  };

  // Save pathway
  const handleSavePathway = (editedPathway) => {
    let updatedPathways = [...pathways];
    
    if (editingItem?.pathwayIndex !== undefined) {
      updatedPathways[editingItem.pathwayIndex] = editedPathway;
    } else {
      updatedPathways.push(editedPathway);
    }
    
    onUpdatePathways(updatedPathways);
    setEditingItem(null);
  };

  // Delete KOU
  const handleDeleteKOU = (kouId) => {
    if (confirm(`Delete KOU "${kous[kouId].name}"? This will also remove all related pathways.`)) {
      const updatedKous = { ...kous };
      delete updatedKous[kouId];
      
      const updatedPathways = pathways.filter(p => p.from !== kouId && p.to !== kouId);
      
      onUpdateKous(updatedKous);
      onUpdatePathways(updatedPathways);
    }
  };

  // Delete pathway
  const handleDeletePathway = (index) => {
    if (confirm('Delete this pathway?')) {
      const updatedPathways = pathways.filter((_, i) => i !== index);
      onUpdatePathways(updatedPathways);
    }
  };

  // Group KOUs by type for display
  const kousByType = Object.values(kous).reduce((acc, kou) => {
    if (!acc[kou.type]) acc[kou.type] = [];
    acc[kou.type].push(kou);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={exportAsJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileJson className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={exportAsCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export CSV
            </button>
            <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('kous')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'kous' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              KOUs ({Object.keys(kous).length})
            </button>
            <button
              onClick={() => setActiveTab('pathways')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'pathways' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Pathways ({pathways.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'kous' ? (
            <div>
              {/* Add new KOU */}
              {!editingItem && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Add new:</span>
                  {Object.entries(KOU_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleAddKOU(value)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {key.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}

              {/* Edit/Add form */}
              {editingItem?.type === 'kou' && (
                <KOUEditor
                  kou={editingItem.item}
                  onSave={handleSaveKOU}
                  onCancel={() => setEditingItem(null)}
                />
              )}

              {/* KOU List */}
              {Object.entries(kousByType).map(([type, kouList]) => (
                <div key={type} className="mb-6">
                  <button
                    onClick={() => toggleSection(type)}
                    className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 capitalize">
                      {type.replace(/_/g, ' ')} ({kouList.length})
                    </h3>
                    {expandedSections[type] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  {expandedSections[type] && (
                    <div className="mt-2 space-y-2">
                      {kouList.map(kou => (
                        <div key={kou.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{kou.name}</h4>
                              <p className="text-sm text-gray-500">ID: {kou.id}</p>
                              {kou.properties?.area && (
                                <p className="text-sm text-gray-600">Area: {kou.properties.area} ha</p>
                              )}
                              {kou.properties?.animalCount && (
                                <p className="text-sm text-gray-600">Animals: {kou.properties.animalCount}</p>
                              )}
                              {kou.properties?.capacity && (
                                <p className="text-sm text-gray-600">
                                  Capacity: {kou.properties.currentStock}/{kou.properties.capacity} 
                                  {kou.type === KOU_TYPES.MANURE_STORE ? ' m³' : ' t'}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingItem({ type: 'kou', item: kou })}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteKOU(kou.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Add new pathway */}
              {!editingItem && (
                <button
                  onClick={handleAddPathway}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Pathway
                </button>
              )}

              {/* Edit/Add form */}
              {editingItem?.type === 'pathway' && (
                <PathwayEditor
                  pathway={editingItem.item}
                  onSave={handleSavePathway}
                  onCancel={() => setEditingItem(null)}
                />
              )}

              {/* Pathways List */}
              <div className="space-y-2">
                {pathways.map((pathway, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {kous[pathway.from]?.name || pathway.from}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="font-medium text-gray-900">
                            {kous[pathway.to]?.name || pathway.to}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            ({pathway.type.replace(/_/g, ' ')})
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600">N: {pathway.nutrients.N} kg</span>
                          <span className="text-purple-600">P: {pathway.nutrients.P} kg</span>
                          <span className="text-yellow-600">K: {pathway.nutrients.K} kg</span>
                          <span className="text-red-600">S: {pathway.nutrients.S} kg</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem({ type: 'pathway', item: pathway, pathwayIndex: index })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePathway(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagement;