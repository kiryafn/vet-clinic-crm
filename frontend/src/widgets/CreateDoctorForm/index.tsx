import { type FormEvent, useState } from 'react';
import { useCreateDoctor } from '../../features/doctor/create/model/useCreateDoctor';
import { Button, Input, Card } from '../../shared/ui';

export const CreateDoctorForm = () => {
    const { createDoctor, isLoading, error, success } = useCreateDoctor();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        specialization_id: '1', // Default to 1 (Therapist)
        price: '1000',
        experience_years: '0'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        createDoctor({
            ...formData,
            specialization_id: Number(formData.specialization_id),
            price: Number(formData.price),
            experience_years: Number(formData.experience_years),
        });
    };

    if (success) {
        return (
            <Card>
                <div className="text-green-600 text-center">
                    Doctor created successfully!
                    <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Create Another</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Add New Doctor">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Specialization ID</label>
                    <select
                        className="p-2 border rounded"
                        name="specialization_id"
                        value={formData.specialization_id}
                        onChange={handleChange}
                    >
                        <option value="1">Therapist</option>
                        <option value="2">Surgeon</option>
                        <option value="3">Ophthalmologist</option>
                    </select>
                </div>

                <Input label="Experience (Years)" type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} />
                <Input label="Price" type="number" name="price" value={formData.price} onChange={handleChange} />

                {error && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" isLoading={isLoading}>
                    Create Doctor
                </Button>
            </form>
        </Card>
    );
};
