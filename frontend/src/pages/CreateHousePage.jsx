import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Camera, CheckCircle2, Home, MapPin, Wallet, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { createHouse } from '../services/houseApi';
import { getAuthenticatedUserId } from '../utils/authUser';

const HOUSE_TYPES = [
  { value: 'MAISON', labelKey: 'create_type_house' },
  { value: 'APPARTEMENT', labelKey: 'create_type_apartment' },
  { value: 'STUDIO', labelKey: 'create_type_studio' },
  { value: 'CHAMBRE', labelKey: 'create_type_room' },
  { value: 'VILLA', labelKey: 'create_type_villa' },
];

const TYPES_WITH_ROOMS = new Set(['MAISON', 'APPARTEMENT', 'VILLA']);
const MAX_PHOTO_COUNT = 4;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_PHOTO_SIZE = 20 * 1024 * 1024;

const initialForm = {
  titre: '',
  description: '',
  adresse: '',
  type: 'MAISON',
  prix: '',
  latitude: '',
  longitude: '',
  nombreChambres: '',
  nombreCuisines: '',
  nombreSallesBain: '',
  nombreToilettes: '',
  disponible: true,
};

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  return Number(value);
};

const CreateHousePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = getAuthenticatedUserId(user);

  const photoNames = useMemo(() => photos.map((photo) => photo.name).join(', '), [photos]);
  const photoPreviews = useMemo(
    () => photos.map((photo) => ({
      file: photo,
      url: URL.createObjectURL(photo),
    })),
    [photos],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [photoPreviews]);

  const validateForm = () => {
    const nextErrors = {};
    const requiresRooms = TYPES_WITH_ROOMS.has(form.type);
    if (!form.titre.trim()) nextErrors.titre = t('create_error_title_required');
    if (!form.adresse.trim()) nextErrors.adresse = t('create_error_address_required');
    if (!form.prix || Number(form.prix) <= 0) nextErrors.prix = t('create_error_price_positive');
    if (form.latitude !== '' && Number.isNaN(Number(form.latitude))) nextErrors.latitude = t('create_error_latitude_invalid');
    if (form.longitude !== '' && Number.isNaN(Number(form.longitude))) nextErrors.longitude = t('create_error_longitude_invalid');
    if (requiresRooms && (!form.nombreChambres || Number(form.nombreChambres) <= 0)) {
      nextErrors.nombreChambres = t('create_error_rooms_positive');
    }
    ['nombreCuisines', 'nombreSallesBain', 'nombreToilettes'].forEach((field) => {
      if (form[field] !== '' && Number(form[field]) < 0) {
        nextErrors[field] = t('create_error_count_positive');
      }
    });
    if (!userId) nextErrors.owner = t('create_error_owner_missing');
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePhotoChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const acceptedFiles = selectedFiles.slice(0, MAX_PHOTO_COUNT);
    const oversizedFile = acceptedFiles.find((file) => file.size > MAX_PHOTO_SIZE);
    const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0);

    if (selectedFiles.length > MAX_PHOTO_COUNT) {
      setPhotoError(t('create_photo_limit_error'));
    } else if (oversizedFile) {
      setPhotoError(t('create_photo_size_error'));
    } else if (totalSize > MAX_TOTAL_PHOTO_SIZE) {
      setPhotoError(t('create_photo_total_size_error'));
    } else {
      setPhotoError('');
    }

    if (oversizedFile || totalSize > MAX_TOTAL_PHOTO_SIZE) {
      setPhotos([]);
      event.target.value = '';
      return;
    }

    setPhotos(acceptedFiles);
  };

  const removePhoto = (index) => {
    setPhotos((current) => current.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const house = await createHouse({
        titre: form.titre.trim(),
        description: form.description.trim(),
        adresse: form.adresse.trim(),
        type: form.type,
        prix: Number(form.prix),
        latitude: toNullableNumber(form.latitude),
        longitude: toNullableNumber(form.longitude),
        nombreChambres: TYPES_WITH_ROOMS.has(form.type) ? Number(form.nombreChambres) : null,
        nombreCuisines: toNullableNumber(form.nombreCuisines),
        nombreSallesBain: toNullableNumber(form.nombreSallesBain),
        nombreToilettes: toNullableNumber(form.nombreToilettes),
        disponible: form.disponible,
        proprietaireId: userId,
        photos,
      });

      navigate(ROUTES.MY_HOUSES, {
        state: {
          createdHouseId: house.id,
          message: house.photoUploadError
            ? t('create_success_photos_failed', { error: house.photoUploadError })
            : t('create_success'),
        },
      });
    } catch (error) {
      setSubmitError(error.message || t('create_submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('create_title')}</h1>
            <p className="text-sm text-gray-500">{t('create_subtitle')}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>
            <ArrowLeft size={18} className="mr-2" />
            {t('create_back')}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 p-6 space-y-6">
              {(submitError || errors.owner) && (
                <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{submitError || errors.owner}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  id="titre"
                  label={t('create_label_title')}
                  value={form.titre}
                  onChange={(event) => updateField('titre', event.target.value)}
                  error={errors.titre}
                  icon={Home}
                  placeholder={t('create_placeholder_title')}
                />

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-1">
                    {t('create_label_type')}
                  </label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(event) => updateField('type', event.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {HOUSE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t(type.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  id="adresse"
                  label={t('create_label_address')}
                  value={form.adresse}
                  onChange={(event) => updateField('adresse', event.target.value)}
                  error={errors.adresse}
                  icon={MapPin}
                  placeholder={t('create_placeholder_address')}
                />

                <Input
                  id="prix"
                  label={t('create_label_price')}
                  type="number"
                  min="1"
                  value={form.prix}
                  onChange={(event) => updateField('prix', event.target.value)}
                  error={errors.prix}
                  icon={Wallet}
                  placeholder="25000"
                />

                {TYPES_WITH_ROOMS.has(form.type) && (
                  <Input
                    id="nombreChambres"
                    label={t('create_label_rooms')}
                    type="number"
                    min="1"
                    value={form.nombreChambres}
                    onChange={(event) => updateField('nombreChambres', event.target.value)}
                    error={errors.nombreChambres}
                    placeholder={t('create_placeholder_rooms')}
                  />
                )}

                <Input
                  id="nombreCuisines"
                  label={t('create_label_kitchens')}
                  type="number"
                  min="0"
                  value={form.nombreCuisines}
                  onChange={(event) => updateField('nombreCuisines', event.target.value)}
                  error={errors.nombreCuisines}
                  placeholder={t('create_placeholder_count')}
                />

                <Input
                  id="nombreSallesBain"
                  label={t('create_label_bathrooms')}
                  type="number"
                  min="0"
                  value={form.nombreSallesBain}
                  onChange={(event) => updateField('nombreSallesBain', event.target.value)}
                  error={errors.nombreSallesBain}
                  placeholder={t('create_placeholder_count')}
                />

                <Input
                  id="nombreToilettes"
                  label={t('create_label_toilets')}
                  type="number"
                  min="0"
                  value={form.nombreToilettes}
                  onChange={(event) => updateField('nombreToilettes', event.target.value)}
                  error={errors.nombreToilettes}
                  placeholder={t('create_placeholder_count')}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
                  {t('create_label_description')}
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('create_placeholder_description')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  id="latitude"
                  label={t('create_label_latitude')}
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(event) => updateField('latitude', event.target.value)}
                  error={errors.latitude}
                  placeholder="4.0511"
                />
                <Input
                  id="longitude"
                  label={t('create_label_longitude')}
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(event) => updateField('longitude', event.target.value)}
                  error={errors.longitude}
                  placeholder="9.7679"
                />
              </div>
            </div>

            <aside className="border-t lg:border-l lg:border-t-0 border-gray-100 p-6 space-y-6">
              <div>
                <label htmlFor="photos" className="block text-sm font-medium text-gray-900 mb-2">
                  {t('create_label_photos')}
                </label>
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 text-center hover:bg-gray-100">
                  <Camera size={28} className="mb-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{t('create_select_photos')}</span>
                  <span className="mt-1 text-xs text-gray-500">{t('create_photo_help')}</span>
                  <span className="mt-1 text-xs text-gray-500 font-medium">{photoNames || t('create_no_file')}</span>
                  <input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                </label>
                {photoError && <p className="mt-2 text-sm text-red-600">{photoError}</p>}
              </div>

              {photoPreviews.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t('create_photo_preview')}</p>
                      <p className="text-xs text-gray-500">{t('create_photo_primary_help')}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {photoPreviews.length} / 4
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photoPreviews.map((preview, index) => (
                      <div key={preview.url} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="h-32 w-full object-cover transition duration-300 group-hover:opacity-80"
                        />
                        <div className="absolute left-0 top-0 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white bg-primary/90">
                          {index === 0 ? t('create_photo_primary') : `#${index + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm hover:bg-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center justify-between gap-4 rounded-md border border-gray-200 p-4">
                <span className="text-sm font-medium text-gray-900">{t('create_available')}</span>
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(event) => updateField('disponible', event.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>

              <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{t('create_initial_status')}</span>
              </div>

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                {t('create_submit')}
              </Button>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHousePage;
