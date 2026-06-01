'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ShieldAlert, Trash2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteListing } from '@/services/api/partner-products';
import { ApiRequestError } from '@/services/api/errors';
import type { Product } from '@/services/api/products';
import styles from './listing-delete-dialog.module.css';

type ListingDeleteDialogProps = {
	open: boolean;
	product: Product;
	onOpenChange: (open: boolean) => void;
};

export function ListingDeleteDialog({
	open,
	product,
	onOpenChange,
}: ListingDeleteDialogProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [confirmationTitle, setConfirmationTitle] = useState('');
	const confirmationMatches = confirmationTitle.trim() === product.title;
	const mutation = useMutation({
		mutationFn: () =>
			deleteListing(product.id, {
				confirmationTitle: confirmationTitle.trim(),
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['partner-products'] });
			await queryClient.invalidateQueries({
				queryKey: ['partner-product', product.id],
			});
			toast.success('Listing deleted.', {
				description: 'The listing was archived and removed from active views.',
			});
			onOpenChange(false);
			router.replace('/partner/listings');
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: 'The listing could not be deleted. Please try again.';

			toast.error('Delete failed', {
				description: message,
			});
		},
	});

	function handleOpenChange(nextOpen: boolean) {
		if (mutation.isPending) {
			return;
		}

		onOpenChange(nextOpen);

		if (!nextOpen) {
			setConfirmationTitle('');
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className={styles.dialog}
				showCloseButton={false}
				aria-describedby="delete-listing-description"
			>
				<DialogHeader className={styles.header}>
					<div className={styles.icon} aria-hidden="true">
						<ShieldAlert />
					</div>
					<span>Permanent partner action</span>
					<DialogTitle>Delete this listing?</DialogTitle>
					<DialogDescription id="delete-listing-description">
						This archives the listing, removes it from partner active views, and
						keeps audit history for security. Listings with active bookings
						cannot be deleted.
					</DialogDescription>
				</DialogHeader>

				<div className={styles.warningPanel}>
					<strong>{product.title}</strong>
					<p>
						Type the exact listing title below. This protects your account from
						accidental deletion.
					</p>
				</div>

				<label className={styles.field}>
					<span>Listing title confirmation</span>
					<Input
						value={confirmationTitle}
						onChange={(event) => setConfirmationTitle(event.target.value)}
						placeholder={product.title}
						icon={<Trash2 aria-hidden="true" />}
						aria-invalid={Boolean(confirmationTitle && !confirmationMatches)}
					/>
					{confirmationTitle && !confirmationMatches ? (
						<small>The title must match exactly.</small>
					) : null}
				</label>

				<DialogFooter className={styles.footer}>
					<Button
						type="button"
						variant="outline"
						disabled={mutation.isPending}
						onClick={() => handleOpenChange(false)}
					>
						<X aria-hidden="true" />
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						className={styles.deleteButton}
						disabled={!confirmationMatches || mutation.isPending}
						onClick={() => mutation.mutate()}
					>
						{mutation.isPending ? (
							<LoaderCircle className={styles.spinner} aria-hidden="true" />
						) : (
							<>
								<Trash2 aria-hidden="true" />
								Delete listing
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
