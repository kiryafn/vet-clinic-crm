import { useState, type FormEvent } from 'react';
import { api } from '../../shared/api/api';
import { Button, Input, Card } from '../../shared/ui';

export const CreateDoctorForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [specializationId, setSpecializationId] = useState('1'); // Default to 1 for now
    const [experience, setExperience] = useState('');
    const [price, setPrice] = useState('');
    const [bio, setBio] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/doctors/', {
                email,
                password,
                full_name: fullName,
                phone_number: null, // Optional
                specialization_id: parseInt(specializationId),
                experience_years: parseInt(experience),
                price: parseFloat(price),
                bio
            });
            onSuccess();
            // Reset form
            setFullName('');
            setEmail('');
            setPassword('');
            setExperience('');
            setPrice('');
            setBio('');
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', '));
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError('Failed to create doctor');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Register New Doctor">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                <div className="input-wrapper">
                    <label className="input-label">Specialization ID</label>
                    {/* Ideally fetch specializations, hardcoding for speed */}
                    <input className="input" type="number" value={specializationId} onChange={e => setSpecializationId(e.target.value)} required />
                </div>

                <div className="flex gap-4">
                    <Input label="Experience (years)" type="number" value={experience} onChange={e => setExperience(e.target.value)} required />
                    <Input label="Price ($)" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>

                <div className="input-wrapper">
                    <label className="input-label">Bio</label>
                    <textarea className="input min-h-[100px]" value={bio} onChange={e => setBio(e.target.value)} />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <Button type="submit" isLoading={isLoading}>Create Doctor</Button>
            </form>
        </Card>
    );
};
